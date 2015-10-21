import Boom from "boom";
import { pagination, id } from "../data/schemas";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathon/{hackathonId}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["list", "paginated", "filterable"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: pagination
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathon/{hackathonId}/participants/{userId}",
    config: {
      description: "Add user to hackathon",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          userId: id
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathon/{hackathonId}/participants/{userId}",
    config: {
      description: "Remove a user from a project",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          userId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "participants",
  version: "1.0.0"
};

export default { register };
