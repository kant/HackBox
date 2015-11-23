/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { pagination, newHackathon, hackathonUpdate, id, stringId } from "../data/validation";
import db, { paginate, ensureHackathon } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const dbQuery = db("hackathons").where({deleted: false});
        const { limit, offset } = request.query;
        reply(paginate(dbQuery, limit, offset));
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
      tags: ["api"],
      handler(request, reply) {
        const ownerId = request.userId();
        let hackathonId;

        // Use transaction to insert hackathon and
        // corresponding entry in admins table
        const response = db.transaction((trx) => {
          return trx
            .insert(request.payload)
            .into("hackathons")
            .then((rows) => {
              hackathonId = rows[0];
              return trx("hackathon_admins").insert({
                hackathon_id: hackathonId,
                user_id: ownerId
              });
            });
        }).then(() => {
          return db("hackathons").where({id: hackathonId});
        }).then((result) => {
          return request.generateResponse(result[0]).code(201);
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
      tags: ["api", "admin"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = db("hackathons")
          .where({id: hackathonId})
          .update({deleted: true})
          .then((result) => {
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
      tags: ["api", "admin"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const { payload } = request;
        // figure out if we should validate if they're an admin
        const ownerId = request.isSuperUser() ? false : request.userId();

        // only superusers can delete/undelete
        // via PUT
        if (!request.isSuperUser()) {
          delete payload.deleted;
        }

        const response = ensureHackathon(hackathonId, {checkOwner: ownerId}).then(() => {
          payload.updated_at = new Date();
          return db("hackathons")
            .where({id: hackathonId})
            .update(payload);
        }).then(() => {
          return db("hackathons").where({id: hackathonId});
        }).then((result) => {
          return result[0];
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
    path: "/hackathons/{hackathonId}",
    config: {
      description: "Fetch details about a single hackathon",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const response = ensureHackathon(hackathonId, {allowDeleted: request.isSuperUser()});
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
    method: "POST",
    path: "/hackathons/{hackathonId}/admins/{userId}",
    config: {
      description: "Add an admin to a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { userId, hackathonId } = request.params;
        const requestorId = request.userId();
        const isSuperUser = request.isSuperUser();

        if (requestorId === userId && !isSuperUser) {
          return reply(Boom.forbidden(`Only super users can add themselves as admins`));
        }

        const response = db("hackathon_admins").where({
          user_id: userId,
          hackathon_id: hackathonId
        }).then((rows) => {
          if (rows.length > 1) {
            throw Boom.conflict(`User ${userId} is already an admin of this hackathon`);
          }
          return;
        }).then(() => {
          return db("hackathon_admins").insert({user_id: userId});
        }).then((result) => {
          console.log('RESULT FROM INSERT', result);
          return request.generateResponse(result[0]).code(201);
        });

        reply(response);
      },
      validate: {
        query: {
          hackathonId: id,
          userId: stringId
        },
        payload: false
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/admins/{userId}",
    config: {
      description: "Remove an admin from a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { userId, hackathonId } = request.params;
        const isSuperUser = request.isSuperUser();
        const ownerId = isSuperUser ? false : request.userId();

        const response = ensureHackathon(hackathonId, {checkOwner: ownerId}).then(() => {
          return db("hackathon_admins").where({
            hackathon_id: hackathonId,
            user_id: userId
          });
        }).then((adminResults) => {
          if (adminResults.length === 1 && !isSuperUser) {
            throw Boom.forbidden(`Cannot remove only remaining admin unless you're a super user.`);
          }
          // make sure user we're removing is an admin
          if (!adminResults.some((admin) => admin.user_id === userId)) {
            throw Boom.notFound(`User ${userId} is not an admin of this hackathon`);
          }
          return db("hackathon_admins").where({
            user_id: userId,
            hackathon_id: hackathonId
          }).del();
        }).then((result) => {
          console.log('ADMIN REMOVE RESULT', result);
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        query: {
          hackathonId: id,
          userId: stringId
        },
        payload: false
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
