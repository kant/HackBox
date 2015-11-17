/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { id, newComment, pagination } from "../data/validation";
import db, { paginate, ensureHackathon, ensureProject } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/comments",
    config: {
      description: "Fetch all comments on a project",
      tags: ["api", "list"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;
        const { limit, offset } = request.query;

        const commentsQuery = db("comments").where({
          project_id: projectId
        });

        const result = Promise.all([
          ensureHackathon(hackathonId),
          ensureProject(hackathonId, projectId),
          paginate(commentsQuery, limit, offset)
        ]).then((results) => {
          return results[2];
        });

        reply(result);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        query: pagination
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{projectId}/comments",
    config: {
      description: "Post a comment",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const result = Promise.all([
          ensureHackathon(hackathonId),
          ensureProject(hackathonId, projectId)
        ]).then(() => {
          return db("comments").insert({
            project_id: projectId,
            body: request.payload.body
          });
        }).then((res) => {
          return db("comments").where({id: res[0]});
        }).then((comments) => {
          return request.generateResponse(comments).code(201);
        });

        reply(result);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        payload: newComment
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/comments/{commentId}",
    config: {
      description: "Delete a comment",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId, commentId } = request.params;

        const result = Promise.all([
          ensureHackathon(hackathonId),
          ensureProject(hackathonId, projectId)
        ]).then(() => {
          return db("comments")
            .where({
              id: commentId,
              project_id: projectId
            })
            .del();
        }).then((res) => {
          if (res === 0) {
            return Boom.notFound(`Comment id ${commentId} not found in project ${projectId}`);
          } else {
            return request.generateResponse().code(204);
          }
        });

        reply(result);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          commentId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "comments",
  version: "1.0.0"
};

export default { register };
