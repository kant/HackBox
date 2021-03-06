/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import fs from "fs";
import { updateUser, stringId, optionalId, countryArray,
  projectArray, roleArray, newUser, paginationWithDeleted,
  sortDirection } from "../data/validation";
import db, { paginate, ensureUser, userSearch } from "../db-connection";
let appInsights = require("applicationinsights");
appInsights.setup().start(); // assuming ikey in env var. start() can be omitted to disable any non-custom data
let client = appInsights.defaultClient;

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
              
        client.trackEvent("Get Hackers", {hackId: query.hackathon_id});
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
            "city", "country","phone"),
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
        // if (!request.query.trust_payload) {
        //   Object.assign(userProps, {
        //     id,
        //     name,
        //     family_name,
        //     given_name,
        //     email
        //   });
        // }

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
          client.trackEvent("New User", {credentials: id});
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
        const requestorId = request.userId();
        const { userId } = request.params;

        if (userId !== requestorId) {
          return reply(Boom.forbidden(`Users can only delete themselves`));
        }

        const response = db.raw(
          `SET foreign_key_checks=0;
           UPDATE projects SET deleted = 1 WHERE owner_id = '${userId}';
           DELETE FROM users WHERE id = '${userId}';
           DELETE FROM participants WHERE user_id = '${userId}';
           DELETE FROM members WHERE user_id = '${userId}';
           SET foreign_key_checks=1;`).then((result) => {
             if (result === 0) {
               throw Boom.badRequest('There was a problem deleting all affilliated data');
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

        client.trackEvent("User Update", {});
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

  server.route({
    method: "GET",
    path: "/users/alias/{alias}",
    config: {
      description: "Fetch details about a single user by alias",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { alias } = request.params;
        const response = db("users").where({alias});
        reply(response);
      },
      validate: {
        params: {
          alias: stringId
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/initmsftemployees",
    config: {
      description: "Write details about all employees to a file",
      tags: ["api"],
      handler(request, reply) {
        let parsedData = [];

        const response = db("reports")
            .select('*')
        .then((data) => {
            data.forEach((elem) => {
              let reportingData = JSON.parse(elem.json_reporting_data);
              parsedData.push([elem.email.replace('@microsoft.com', '').toLowerCase(), reportingData.DisplayName.replace("Ou0027","O'")])
            })
            return db("users").select('*').where('email', 'like', 'v-%').orWhereNotNull('external');
        })
        .then((data) => {
            data.forEach((elem) => {
              if (elem.external == null) {
                parsedData.push([elem.email.replace('@microsoft.com', '').toLowerCase(), elem.name.replace("Ou0027","O'"), elem.id]);
              } else {
                parsedData.push([elem.email.toLowerCase(), elem.name.replace("Ou0027","O'"), elem.id]);
              }
            })

           

            fs.writeFile('data/msft.json', JSON.stringify(parsedData), 'utf8', function(err, result) {
              if (!err) {
                  return request.generateResponse().code(200);
              } else {
                console.log(err);
              }
            });

        });
        
        reply(response);
      }
    }
  });

  server.route({
    method: "GET",
    path: "/msftemployees",
    config: {
      description: "Fetch details about all employees",
      tags: ["api"],
      handler(request, reply) {
        console.log(request.query);
          let time = Date.now();
          fs.readFile('data/msft.json', 'utf8', function(err, result) {
            if (!err) {
                let list = JSON.parse(result);
                let filteredResult = [];
                list.forEach((person) => {
                  if (person[0].includes(request.query.q) || person[1].toLowerCase().includes(request.query.q)) {
                      filteredResult.push({alias: person[0], name: person[1], id: person[2] ? person[2] : undefined});
                  }
                })
                console.log('Time elapsed: ' + (Date.now() - time) + 'ms');
                reply(filteredResult);
            } else {
              console.log(err);
            }
          });

        
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
