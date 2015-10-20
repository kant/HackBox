import Boom from "boom";
import { pagination, newUser, user, id } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/users",
    config: {
      description: "Fetch all users",
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
    path: "/users",
    config: {
      description: "Create a new users",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: newUser,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/users/{id}",
    config: {
      description: "Delete a user",
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
    path: "/users/{id}",
    config: {
      description: "Edit user details",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: user,
        params: {id},
      },
    },
  });

  server.route({
    method: "GET",
    path: "/users/{id}",
    config: {
      description: "Fetch details about a single user",
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
  name: "users",
  version: "1.0.0",
};

export default { register };
