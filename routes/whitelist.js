/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import { updateUser, stringId, optionalId, countryArray,
  projectArray, roleArray, newUser, paginationWithDeleted,
  sortDirection } from "../data/validation";
import db, { paginate } from "../db-connection";

const register = function (server, options, next) {



  server.route({
    method: "GET",
    path: "/whitelist/{userEmail}",
    config: {
      description: "Get email from registered emails table",
      tags: ["email", "whitelist"],
      handler(request, reply) {
        const { userEmail } = request.params;
        const response = db("whitelist").where({email: userEmail});
        reply(response);
      }
    }
  });

  server.route({
    method: "POST",
    path: "/whitelist",
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
  name: "whitelist",
  version: "1.0.0"
};

export default { register };
