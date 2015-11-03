import Boom from "boom";
import { pagination, id } from "../data/validation";
import db, { resolveOr404 } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["list", "paginated", "filterable"],
      handler(request, reply) {
        const query = db.select()
          .table("participants")
          .where({hackathon_id: request.params.hackathonId})
          .limit(request.query.limit)
          .offset(request.query.offset);

        query.then((results) => {
          if (results.length === 0) {
            return reply([]);
          }

          const userQuery = db("users");
          results.forEach((result) => {
            userQuery.orWhere({id: result.user_id});
          });
          reply(userQuery);
        });
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
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Add user to hackathon",
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const participant = {
          user_id: userId,
          hackathon_id: hackathonId
        }

        // existence checks
        const userQuery = db("users").where({id: userId});
        const hackathonQuery = db("hackathons").where({id: userId});

        // participant check
        const participantQuery = db("participants").where(participant);

        Promise.all([
          userQuery,
          hackathonQuery,
          participantQuery
        ]).then(([userResult, hackathonResult, projectResult, memberResult]) => {
          if (userResult.length === 0) {
            return reply(Boom.notFound(`No user with id ${userId} was found`));
          }
          if (hackathonResult.length === 0) {
            return reply(Boom.notFound(`No hackathon with id ${hackathonId} was found`));
          }
          if (participantQuery.length > 0) {
            return reply(Boom.preconditionFailed(`User ${userId} is in hackahton ${hackathonId}`));
          }
          db("participants")
            .insert(participant)
            .then(() => {
              reply(userResult[0]).code(201);
            });
        });
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
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Remove a user from a project",
      handler(request, reply) {
        const participant = {
          user_id: request.params.userId,
          hackathon_id: request.params.hackathonId,
        };

        const query = db("participants").where(participant).del();
        const response = query.then((result) => {
          if (result === 0) {
            return Boom.notFound(`Participant id ${request.params.id} not found`);
          } else {
            return request.generateResponse().code(204);
          }
        });

        reply(response);
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
