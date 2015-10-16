import { hackathons } from "../fixtures/mock-data";

export function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      handler(request, reply) {
        console.log(hackathons)
        reply(hackathons);
      },
    },
  });

  server.route({
    method: "GET",
    path: "/hackathons/{id}",
    config: {
      handler(request, reply) {

      },
    },
  });

  next();
}

register.attributes = {
  name: "hackathons",
  version: "1.0.0",
};
