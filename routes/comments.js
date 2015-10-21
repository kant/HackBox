import Boom from "boom";
import { id, newComment } from "../data/schemas";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathon/{hackathonId}/projects/{projectId}/comments",
    config: {
      description: "Fetch all comments on a project",
      tags: ["list"],
      handler(request, reply) {
        reply(Boom.notImplemented());
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
    path: "/hackathon/{hackathonId}/projects/{projectId}/comments",
    config: {
      description: "Post a comment",
      handler(request, reply) {
        reply(Boom.notImplemented());
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
    path: "/hackathon/{hackathonId}/projects/{projectId}/comments/{commentId}",
    config: {
      description: "Delete a comment",
      handler(request, reply) {
        reply(Boom.notImplemented());
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
