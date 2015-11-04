/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { pagination, id } from "../data/validation";
import db, { ensureHackathon, ensureUser, ensureParticipant } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/participants",
    config: {
      description: "Fetch all participants",
      tags: ["list", "paginated", "filterable"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
          return db("participants")
            .where({hackathon_id: hackathonId})
            .limit(request.query.limit)
            .offset(request.query.offset);
        }).then((results) => {
          if (results.length === 0) {
            return [];
          }
          const userIds = results.map((participant) => participant.user_id);
          return db("users").whereIn("id", userIds);
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
      handler(request, reply) {
        const { hackathonId, userId } = request.params;

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
            throw Boom.preconditionFailed(`User ${userId} is in hackahton ${hackathonId}`);
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
        const { hackathonId, userId } = request.params;

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
