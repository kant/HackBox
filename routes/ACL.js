import Boom from "boom";
import Joi from "joi";
import db, { paginate } from "../db-connection";
import * as hbLogger from "../hbLogger";

const register = function (server, options, next) {
    
  server.route({
    method: "GET",
    path: "/acl/{email}",
    config: {
      description: "Get emails from acl table",
      tags: ["api", "email", "acl"],
        handler(request, reply) {
            const { email } = request.params;
            const response = db("acl").where({ email }).then((result) => {
                if (result) {
                    hbLogger.info(`acl - /acl/{email} - result length: ${result.length}`);
                }
                if (result.length === 0) {
                    return { inAcl: false };
                } else {
                    return { inAcl: true };
                }
            });
            
        reply(response);
        },
        validate: {
            params: {
                email: Joi.string().email()
            }
        }
    }
  });

  server.route({
        method: "POST",
        path: "/acl/add",
        config: {
            description: "add new email to acl list",
            tags: ["api"],
            handler(request, reply) {
                const { payload } = request;
                const response = db("acl").where({ email: payload.email }).then((result) => {

                    if (result.length > 0) {
                        return { result: 'email already exist' };
                    }
                    //Prepare object to insert
                    let newEmail = {
                        email: payload.email
                    };
                    //Insert 
                    return db("acl").insert(newEmail)
                        .then(() => {
                            return request.generateResponse({ result: `${newEmail.email} has been added to acl` }).code(200);
                        });
                });

                reply(response);
            },
            validate: {                
                payload: {
                    email: Joi.string().email()
                }
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
