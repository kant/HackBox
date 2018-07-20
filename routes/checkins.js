import Boom from "boom";
import Joi from "joi";
import db from "../db-connection";
import hbLogger from "../hbLogger";

const register = function (server, options, next) {



  server.route({
    method: "GET",
    path: "/checkin/hackathon/{hackathonId}/user/{alias}",
    config: {
      description: "Get user information for checkin",
      tags: ["alias", "whitelist", "api"],
      handler(request, reply) {
        const objectToReturn = {
          userId: "",
          name: "",
          registered: false,
          checkedIn: false,
          projects: []
        };
        let userObject;
        const {alias, hackathonId} = request.params;

        db("users").where({alias: `${alias}@microsoft.com`}).then((result) => {
          if (!result.length) {
            return Promise.reject("User not found");
          }
          objectToReturn.userId = result[0].id;
          objectToReturn.name = result[0].name;
          return db("participants").where({
            user_id: result[0].id,
            hackathon_id: hackathonId
          });
        }).then((registeredUser) => {
          if (!registeredUser.length) {
            return Promise.reject({return: true, objectToReturn});
          } else {
            objectToReturn.registered = true;
            userObject = registeredUser[0];
            return db("checkins").where({user_id: userObject.user_id, hackathon_id: hackathonId});
          }
        })
        .then((checkedInUser) => {
          objectToReturn.checkedIn = !checkedInUser.length ? false : true;
          return db("projects").select("projects.id", "projects.title", "projects.tent_name", "projects.tent_color").join("members", function () {
            this.onIn("members.user_id", userObject.user_id)
              .andOn("members.project_id", "=", "projects.id")
              .andOn("projects.hackathon_id", "=", 1074);
          });
        }).then((projects) => {
            objectToReturn.projects = projects;
            reply(objectToReturn);
        }).catch((err) => {
            if (err === "User not found") {
                reply({msg: "User not found"});
            } else if (err.return) {
                reply(err.objectToReturn);
            } else {
                reply(Boom.create(500));
            }
        });
      },
      validate: {
        params: {
          hackathonId: Joi.number().integer().positive().required(),
          alias: Joi.string().min(1).max(30).trim().required()
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/checkin/hackathon/{hackathonId}/user/{userId}",
    config: {
      description: "Check in user for specific hackathon",
      tags: ["checkin", "api"],
      handler(request, reply) {
        const {userId, hackathonId} = request.params;
        
        const response = db("checkins").insert({
          user_id: userId,
          hackathon_id: hackathonId
        }).then(r => {
          return r;
        }).catch(e => {
          hbLogger.info(`checkin exception: ${e.message}`);
        });
        reply(response);
      },
      validate: {
        params: {
          hackathonId: Joi.number().integer().positive().required(),
          userId: Joi.string().min(1).max(140).trim().required()
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
