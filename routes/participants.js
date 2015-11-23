/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { pagination, id, stringId } from "../data/validation";
import db, { paginate, ensureHackathon, ensureUser, ensureParticipant } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["api", "list", "paginated", "filterable"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
          const { limit, offset } = request.query;
          const query = db("participants").where({hackathon_id: hackathonId});

          return paginate(query, limit, offset);
        }).then((results) => {
          // if it's empty, stop here
          if (results.data.length === 0) {
            return results;
          }

          // if not, query for users and populate with user data instead
          const userIds = results.data.map((participant) => participant.user_id);
          return db("users").whereIn("id", userIds).then((userResults) => {
            results.data = userResults;
            return results;
          });
        });

        reply(response);
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
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const requestorId = request.userId();

        if (requestorId !== userId) {
          return reply(Boom.forbidden("You can only add yourself"));
        }

        const participant = {
          user_id: userId,
          hackathon_id: hackathonId
        };

        const response = Promise.all([
          ensureHackathon(hackathonId),
          ensureUser(userId),
          db("participants").where(participant)
        ]).then((results) => {
          if (results[2] > 0) {
            throw Boom.preconditionFailed(`User ${userId} is already in hackathon ${hackathonId}`);
          }
        }).then(() => {
          return db("participants").insert(participant);
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          userId: stringId
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/participants/{userId}",
    config: {
      description: "Remove a user from a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, userId } = request.params;
        const requestorId = request.userId();

        if (requestorId !== userId) {
          return reply(Boom.forbidden("You can only remove yourself"));
        }

        const participant = {
          user_id: userId,
          hackathon_id: hackathonId
        };

        const response = Promise.all([
          ensureHackathon(hackathonId),
          ensureUser(userId),
          ensureParticipant(hackathonId, userId)
        ]).then(() => {
          return db("participants").where(participant).del();
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          userId: stringId
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
