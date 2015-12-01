/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { id, stringId } from "../data/validation";
import db, { ensureProject, ensureUser } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members",
    config: {
      description: "Fetch all members of a project",
      tags: ["api", "list"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();

        const result = Promise.all([
          ensureProject(hackathonId, projectId, {checkOwner}),
          db("members").where({project_id: projectId}).select("user_id")
        ]).then((results) => {
          const memberIds = results[1].map((member) => member.user_id);
          return db("users").whereIn("id", memberIds);
        });

        reply(result);
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
      tags: ["api"],
      handler(request, reply) {
        const { userId, hackathonId, projectId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();
        const member = {
          user_id: userId,
          project_id: projectId
        };

        const response = Promise.all([
          ensureProject(hackathonId, projectId, {checkOwner}),
          ensureUser(userId),
          db("members").where(member)
        ]).then((result) => {
          // if user already a member, throw
          if (result[2].length > 0) {
            throw Boom.preconditionFailed(`User ${userId} is already in project ${projectId}`);
          }
        }).then(() => {
          return db("members").insert(member);
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members/{userId}",
    config: {
      description: "Remove a member from a team",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId, userId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureProject(hackathonId, projectId, {checkOwner})
        ]).then(() => {
          return db("members").where({
            user_id: userId,
            project_id: projectId
          }).del();
        }).then((result) => {
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
          userId: stringId
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
