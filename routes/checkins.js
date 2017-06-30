import Boom from "boom";
import Joi from "joi";
import { updateUser, stringId, optionalId, countryArray,
  projectArray, roleArray, newUser, paginationWithDeleted,
  sortDirection } from "../data/validation";
import db, { paginate } from "../db-connection";

const register = function (server, options, next) {



  server.route({
    method: "GET",
    path: "/checkin/hackathon/{hackathonId}/user/{alias}",
    config: {
      description: "Get user information for checkin",
      tags: ["alias", "whitelist"],
      handler(request, reply) {
        const objectToReturn = {
          registered: false,
          checkedIn: false,
          projects: []
        };
        const {alias, hackathonId} = request.params;
        const response = db("users").where({alias: `${alias}@microsoft.com`}).then((result) => {
          if (!result.length) { throw Boom.notFound(`User not found`); }
          return db("participants").where({user_id: result[0].id, hackathon_id: hackathonId});
        }).then((registeredUser) => {
          if (!registeredUser.length) { reply(objectToReturn); }

        });
        
        // reply(response);
      }
    }
  });

  server.route({
    method: "POST",
    path: "/whitelist2",
    config: {
      description: "Add email to registered emails table",
      tags: ["email", "whitelist"],
      handler(request, reply) {

        var response = db("whitelist").whereIn('email', request.payload.emails).then((result) => {
          console.log(result.length);
          if (result.length == 0) {
            const emails = request.payload.emails.map((email) => {
              return {email: email, organization_id: request.payload.organization_id};
            })

            return db("whitelist").insert(emails);
          } else {
            throw Boom.conflict(`Email is already in the invitation list`);
          }
        });

        reply(response)
      },
      validate: {
        payload: {
          emails: Joi.array().items(Joi.string().email().required()),
          organization_id: Joi.number().required()
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "checkins",
  version: "1.0.0"
};

export default { register };
