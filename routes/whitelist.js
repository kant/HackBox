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
      tags: ["email", "detail"],
      handler(request, reply) {
        const { userEmail } = request.params;
        const response = db("registered_emails").where({email: userEmail});
        reply(response);
      }
    }
  });

  server.route({
    method: "POST",
    path: "/whitelist",
    config: {
      description: "Add email to registered emails table",
      tags: ["email", "detail"],
      handler(request, reply) {
        console.log('------------->>>>');
        console.log(request.payload);
        const response = db("whitelist").insert(request.payload);
        reply(response);
      },
      validate: {
        payload: {
          emails: Joi.array().items(Joi.string().email())
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
