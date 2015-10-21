import Boom from "boom";
import { hackathons } from "../data/mock-data";
import { pagination, newHackathon, hackathon, id } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      tags: ["paginated", "list"],
      handler(request, reply) {
        reply(hackathons);
      },
      validate: {
        query: pagination,
      },
    },
  });

  server.route({
    method: "POST",
    path: "/hackathons",
    config: {
      description: "Create a new hackathon",
      tags: ["admin"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: newHackathon,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{id}",
    config: {
      description: "Delete a hackathon",
      tags: ["admin"],
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
    path: "/hackathons/{id}",
    config: {
      description: "Edit hackathon details",
      tags: ["admin"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: hackathon,
        params: {id},
      },
    },
  });

  server.route({
    method: "GET",
    path: "/hackathons/{id}",
    config: {
      description: "Fetch details about a single hackathon",
      tags: ["detail"],
      handler(request, reply) {
        console.log('HERE')
        const found = hackathons.find(event => event.id === request.params.id);
        if (found) {
          reply(found);
        } else {
          reply(Boom.notFound());
        }
      },
      validate: {
        params: {id},
      },
    },
  });

  next();
}

register.attributes = {
  name: "hackathons",
  version: "1.0.0",
};

export default { register };
