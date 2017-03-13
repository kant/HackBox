/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import { updateUser, stringId, optionalId, countryArray,
  projectArray, roleArray, newUser, paginationWithDeleted,
  sortDirection } from "../data/validation";
import db, { paginate, ensureUser, userSearch } from "../db-connection";
import appInsights from "applicationinsights";

const client = appInsights.getClient();

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/users",
    config: {
      description: "Fetch users",
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const { query } = request;
        const { limit, offset } = query;

        if ((query.has_project === true || query.has_project === false) && !query.hackathon_id) {
          return reply(Boom.badRequest("cannot specify 'has_project' without a 'hackathon_id'"));
        }
        const response = userSearch(request.query);

        reply(paginate(response, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          hackathon_id: optionalId,
          has_project: Joi.boolean(),
          product_focus: projectArray, // TODO join this with productArray
          role: roleArray,
          country: countryArray,
          sort_col: Joi.any().valid("given_name", "family_name", "alias", "job_title", "department",
            "city", "country"),
          sort_direction: sortDirection
        })
      }
    }
  });

  server.route({
    method: "POST",
    path: "/users",
    config: {
      description: "Create a new user",
      tags: ["api"],
      handler(request, reply) {
        client.trackEvent("NewUser", {credentials: request.auth.credentials.name});
        const userProps = {};
        const { id, name, family_name, given_name, email } = request.auth.credentials;

        // only super users can specify that payload should be trusted
        if (request.query.trust_payload && !request.isSuperUser()) {
          return reply(Boom.forbidden("only super users can pass 'trust_payload'"));
        }

        if (id !== request.userId() && !request.isSuperUser) {
          return reply(Boom.forbidden("only super users can add users other than themselves"));
        }

        // userProps is what will ultimately be persisted.
        // here we add things from payload and override updated_at
        // and deleted
        Object.assign(userProps, request.payload, {
          updated_at: new Date(),
          // we force this to be false
          // since they may be re-activating
          // a "deleted" user
          deleted: false
        });

        // Unless trust_payload is passed
        // we also override payload data with
        // items from the auth credentials
        if (!request.query.trust_payload) {
          Object.assign(userProps, {
            id,
            name,
            family_name,
            given_name,
            email
          });
        }

        // Check to make sure it doesn't exist, it's possible it was
        // soft deleted, if so, re-inserting same ID would fail.
        const response = db("users").where({id: userProps.id}).then((result) => {
          if (result.length) {
            return db("users").update(userProps).where({id: userProps.id});
          } else {
            return db("users").insert(userProps);
          }
        }).then((res) => {
          request.log(["database", "response", "insert"], res);
          return ensureUser(userProps.id);
        }).then((result) => {
          return request.generateResponse(result).code(201);
        });

        reply(response);
      },
      validate: {
        payload: newUser,
        query: {
          trust_payload: Joi.boolean()
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/users/{userId}",
    config: {
      description: "Delete a user",
      tags: ["api"],
      handler(request, reply) {
        const isSuperUser = request.isSuperUser();
        const requestorId = request.userId();
        const { userId } = request.params;

        if (userId !== requestorId && !isSuperUser) {
          return reply(Boom.forbidden(`Only admins can delete users other than themselves`));
        }

        const response = db("users")
          .where({id: userId})
          .update({deleted: true}).then((result) => {
            if (result === 0) {
              throw Boom.notFound(`User id ${userId} not found`);
            }

            return request.generateResponse().code(204);
          });

        reply(response);
      },
      validate: {
        params: {
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/users/{userId}",
    config: {
      description: "Edit user details",
      tags: ["api"],
      handler(request, reply) {
        const { userId } = request.params;
        const { payload } = request;

        // remove value of `deleted` unless requestor is super user
        if (payload.hasOwnProperty("deleted") && !request.isSuperUser()) {
          delete payload.deleted;
        }

        const response = db("users")
          .where({id: userId})
          .update(payload)
        .then(() => {
          return ensureUser(userId);
        });

        client.trackEvent("UserUpdate", {});
        reply(response);
      },
      validate: {
        payload: updateUser,
        params: {
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/users/{userId}",
    config: {
      description: "Fetch details about a single user",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { userId } = request.params;
        const response = ensureUser(userId, {
          allowDeleted: request.isSuperUser()
        });
        reply(response);
      },
      validate: {
        params: {
          userId: stringId
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "users",
  version: "1.0.0"
};

export default { register };
