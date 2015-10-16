import Joi from "joi";
import Boom from "boom";
import { hackathons } from "../fixtures/mock-data";

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
        query: {
          limit: Joi.number().integer().min(1).max(100).default(10),
          offset: Joi.number().integer().min(0).default(0),
        },
      },
    },
  });

  server.route({
    method: "GET",
    path: "/hackathons/{id}",
    config: {
      handler(request, reply) {
        const found = hackathons.find((event => event.id === request.params.id));
        if (found) {
          reply(found);
        } else {
          reply(Boom.notFound());
        }
      },
      tags: ["detail"],
      description: "Fetch details about a single hackathon",
      validate: {
        params: {
          id: Joi.number().integer(),
        },
      },
    },
  });

  next();
}

register.attributes = {
  name: "hackathons",
  version: "1.0.0",
};

export default { register }
