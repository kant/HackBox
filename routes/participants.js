import Boom from "boom";
import { pagination, newParticipant, participant, id } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/participants",
    config: {
      description: "Fetch all participants",
      tags: ["paginated", "list"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        query: pagination,
      },
    },
  });

  server.route({
    method: "POST",
    path: "/participants",
    config: {
      description: "Create a new participant",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: newParticipant,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/participants/{id}",
    config: {
      description: "Delete a participant",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {id},
      },
    },
  });

  server.route({
    method: "PUT",
    path: "/participants/{id}",
    config: {
      description: "Edit participant details",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: participant,
        params: {id},
      },
    },
  });

  server.route({
    method: "GET",
    path: "/participants/{id}",
    config: {
      description: "Fetch details about a single participant",
      tags: ["detail"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: id,
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
