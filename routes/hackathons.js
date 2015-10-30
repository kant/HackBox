import Boom from "boom";
import { pagination, newHackathon, hackathonUpdate, id } from "../data/validation";
import db, { resolveOr404 } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      tags: ["paginated", "list"],
      handler(request, reply) {
        reply(db.select()
          .table("hackathons")
          .limit(request.query.limit)
          .offset(request.query.offset));
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
        const query = db("hackathons").insert(request.payload);

        query.then((result) => {
          const getQuery = db("hackathons").where({id: result[0]});
          reply(resolveOr404(getQuery)).code(201);
        })
        .catch((err) => {
          reply(err);
        });
      },
      validate: {
        payload: newHackathon
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{id}",
    config: {
      description: "Delete a hackathon",
      tags: ["admin"],
      handler(request, reply) {
        const query = db("hackathons")
          .where({id: request.params.id})
          .del();

        const response = query.then((result) => {
          if (result === 0) {
            return Boom.notFound(`Hackathon id ${request.params.id} not found`);
          } else {
            return request.generateResponse().code(204);
          }
        });

        reply(response);
      },
      validate: {
        params: {id}
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{id}",
    config: {
      description: "Edit hackathon details",
      tags: ["admin"],
      handler(request, reply) {
        reply(db("hackathons")
          .where({id: request.params.id})
          .update(request.payload));
      },
      validate: {
        payload: hackathonUpdate,
        params: {id}
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
