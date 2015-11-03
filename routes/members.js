/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { id } from "../data/validation";
import db from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members",
    config: {
      description: "Fetch all members of a project",
      tags: ["list"],
      handler(request, reply) {
        const query = db("members").where({
          hackathon_id: request.params.hackathonId,
          project_id: request.params.projectId
        });

        query.then((results) => {
          if (results.length === 0) {
            return reply([]);
          }

          const userQuery = db("users");
          results.forEach((result) => {
            userQuery.orWhere({id: result.user_id});
          });
          reply(userQuery);
        });
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members/{userId}",
    config: {
      description: "Add a member to a projects",
      handler(request, reply) {
        const { userId, hackathonId, projectId } = request.params;
        const member = {
          user_id: userId,
          hackathon_id: hackathonId,
          project_id: projectId
        };

        // existence checks
        const userQuery = db("users").where({id: userId});
        const hackathonQuery = db("hackathons").where({id: userId});
        const projectQuery = db("projects").where({id: projectId});

        // membership check
        const memberQuery = db("members").where(member);

        Promise.all([
          userQuery,
          hackathonQuery,
          projectQuery,
          memberQuery
        ]).then(([userResult, hackathonResult, projectResult, memberResult]) => {
          if (userResult.length === 0) {
            return reply(Boom.notFound(`No user with id ${userId} was found`));
          }
          if (hackathonResult.length === 0) {
            return reply(Boom.notFound(`No hackathon with id ${hackathonId} was found`));
          }
          if (projectResult.length === 0) {
            return reply(Boom.notFound(`No project with id ${projectId} was found`));
          }
          if (memberResult.length > 0) {
            return reply(Boom.preconditionFailed(`User ${userId} is in project ${projectId}`));
          }
          db("members")
            .insert(member)
            .then(() => {
              reply(userResult[0]).code(201);
            });
        });
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          userId: id
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members/{userId}",
    config: {
      description: "Remove a member from a team",
      handler(request, reply) {
        const member = {
          user_id: request.params.userId,
          hackathon_id: request.params.hackathonId,
          project_id: request.params.projectId
        };
        const query = db("members").where(member).del();
        const response = query.then((result) => {
          if (result === 0) {
            return Boom.notFound(`Member id ${request.params.id} not found`);
          } else {
            return request.generateResponse().code(204);
          }
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          userId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "members",
  version: "1.0.0"
};

export default { register };
