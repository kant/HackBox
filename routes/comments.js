import Boom from "boom";
import { id, newComment } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathon/{hackathon_id}/projects/{project_id}/comments",
    config: {
      description: "Fetch all comments on a project",
      tags: ["list"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          project_id: id,
        },
      },
    },
  });

  server.route({
    method: "POST",
    path: "/hackathon/{hackathon_id}/projects/{project_id}/comments",
    config: {
      description: "Post a comment",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          project_id: id,
        },
        payload: newComment,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/hackathon/{hackathon_id}/projects/{project_id}/comments/{comment_id}",
    config: {
      description: "Delete a comment",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          project_id: id,
          comment_id: id,
        },
      },
    },
  });

  next();
}

register.attributes = {
  name: "comments",
  version: "1.0.0",
};

export default { register };
