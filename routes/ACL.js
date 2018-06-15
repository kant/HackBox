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
    path: "/acl/{email}",
    config: {
      description: "Get emails from acl table",
      tags: ["email", "acl"],
        handler(request, reply) {
            const { email } = request.params;
            const response = db("ACL").where({ email }).then((result) => {
                console.log('check email exist result ' + result.length);
                if (result.length === 0) {
                    return { inAcl: false };
                } else {
                    return { inAcl: true };
                }
            });
            
        reply(response);
      }
    }
  });
    
  next();
};

register.attributes = {
  name: "acl",
  version: "1.0.0"
};

export default { register };
