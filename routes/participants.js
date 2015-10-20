import Boom from "boom";
import { pagination, id } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathon/{hackathon_id}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["list", "paginated", "filterable"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
        },
        query: pagination,
      },
    },
  });

  server.route({
    method: "POST",
    path: "/hackathon/{hackathon_id}/participants/{user_id}",
    config: {
      description: "Add user to hackathon",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          user_id: id,
        },
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/hackathon/{hackathon_id}/participants/{user_id}",
    config: {
      description: "Remove a user from a project",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          user_id: id,
        },
      },
    },
  });

  next();
}

register.attributes = {
  name: "participants",
  version: "1.0.0",
};

export default { register };
