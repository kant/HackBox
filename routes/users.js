/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { updateUser, stringId,
  newUser, paginationWithDeleted } from "../data/validation";
import db, { paginate, ensureUser } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/users",
    config: {
      description: "Fetch all users",
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const includeDeleted = request.query.include_deleted;
        const { limit, offset } = request.query;
        const query = db("users")
          .where(includeDeleted ? {} : {deleted: false})
          .orderBy("name", "asc");

        reply(paginate(query, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted
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
        const userProps = {};
        const { id, name, family_name, given_name, email } = request.auth.credentials;

        Object.assign(userProps, request.payload, {
          id,
          name,
          family_name,
          given_name,
          email,
          updated_at: new Date(),
          // we force this to be false
          // since they may be re-activating
          // a "deleted" user
          deleted: false
        });

        // Check to make sure it doesn't exist, it's possible it was
        // soft deleted, if so, re-inserting same ID would fail.
        const response = db("users").where({id}).then((result) => {
          if (result.length) {
            return db("users").update(userProps).where({id});
          } else {
            return db("users").insert(userProps);
          }
        }).then(() => {
          return ensureUser(id);
        }).then((result) => {
          return request.generateResponse(result).code(201);
        });

        reply(response);
      },
      validate: {
        payload: newUser
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
