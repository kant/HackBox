import Boom from "boom";
import { pagination, user, id } from "../data/validation";
import db, { paginate, resolveOr404 } from "../db-connection";
const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/users",
    config: {
      description: "Fetch all users",
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const { limit, offset } = request.query;
        const query = db("users");

        reply(paginate(query, limit, offset));
      },
      validate: {
        query: pagination
      }
    }
  });

  server.route({
    method: "POST",
    path: "/users",
    config: {
      description: "Create a new user",
      tags: ["api"],
      handler(request, reply) {
        const response = db("users").insert(request.payload).then((result) => {
          return db("users").where({id: result[0]});
        }).then((result) => {
          return request.generateResponse(result).code(201);
        });

        reply(response);
      },
      validate: {
        // payload: newUser
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/users/{id}",
    config: {
      description: "Delete a user",
      tags: ["api"],
      handler(request, reply) {
        const response = db("users").where({id: request.params.id}).del().then((result) => {
          if (result === 0) {
            return Boom.notFound(`User id ${request.params.id} not found`);
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
    path: "/users/{id}",
    config: {
      description: "Edit user details",
      tags: ["api"],
      handler(request, reply) {
        const { userId } = request.params;
        const response = db("users")
          .where({id: userId})
          .update(request.payload)
        .then(() => {
          return db("userid").where({id: userId});
        });

        reply(response);
      },
      validate: {
        payload: user,
        params: {id}
      }
    }
  });

  server.route({
    method: "GET",
    path: "/users/{id}",
    config: {
      description: "Fetch details about a single user",
      tags: ["api", "detail"],
      handler(request, reply) {
        const query = db("users")
          .select()
          .where({id: request.params.id});

        reply(resolveOr404(query, "user"));
      },
      validate: {
        params: {id}
      }
    }
  });

  next();
};

register.attributes = {
  name: "users",
  version: "1.0.0"
};

export default { register };
