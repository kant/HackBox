import Boom from "boom";
import { pagination, newHackathon, hackathonUpdate, id } from "../data/validation";
import db, { resolveOr404, ensureHackathon } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      tags: ["paginated", "list"],
      handler(request, reply) {
        const query = db("hackathons")
          .limit(request.query.limit)
          .offset(request.query.offset);

        reply(query);
      },
      validate: {
        query: pagination
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons",
    config: {
      description: "Create a new hackathon",
      tags: ["admin"],
      handler(request, reply) {
        const response = db("hackathons").insert(request.payload).then((result) => {
          return db("hackathons").where({id: result[0]});
        }).then((result) => {
          return request.generateResponse(result).code(201);
        });

        reply(response);
      },
      validate: {
        payload: newHackathon
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}",
    config: {
      description: "Delete a hackathon",
      tags: ["admin"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = db("hackathons").where({id: hackathonId}).del().then((result) => {
          if (result === 0) {
            return Boom.notFound(`Hackathon id ${hackathonId} not found`);
          } else {
            return request.generateResponse().code(204);
          }
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}",
    config: {
      description: "Edit hackathon details",
      tags: ["admin"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const response = ensureHackathon(hackathonId).then(() => {
          return db("hackathons")
            .where({id: hackathonId})
            .update(request.payload);
        }).then(() => {
          return db("hackathons").where({id: hackathonId});
        });

        reply(response);
      },
      validate: {
        payload: hackathonUpdate,
        params: {
          hackathonId: id
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{id}",
    config: {
      description: "Fetch details about a single hackathon",
      tags: ["detail"],
      handler(request, reply) {
        const query = db("hackathons")
          .select()
          .where({id: request.params.id});

        reply(resolveOr404(query, "hackathon"));
      },
      validate: {
        params: {id}
      }
    }
  });

  next();
};

register.attributes = {
  name: "hackathons",
  version: "1.0.0"
};

export default { register };
