/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { newHackathon, hackathonUpdate, id,
  stringId, paginationWithDeleted } from "../data/validation";
import db, { paginate, ensureHackathon } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const { limit, offset } = request.query;
        const includeDeleted = request.query.include_deleted;
        const includeUnpublished = request.query.include_unpublished;

        const columns = [
          "id",
          "name",
          "slug",
          "logo_url",
          "start_at",
          "end_at",
          "org",
          "city",
          "country",
          "tagline",
          "color_scheme",
          "created_at",
          "updated_at",
          "deleted",
          "is_public",
          "is_published",
          "json_meta"
        ];

        /*eslint-disable no-valid-this */
        const dbQuery = db
          .select(columns)
          .from("hackathons")
          .where({is_published: true})
          .andWhere({deleted: false})
          .union(() => {
            this.select(columns)
              .from("hackathons")
              .whereIn("id", () => {
                this.select("hackathon_id")
                  .from("hackathon_admins")
                  .where("user_id", request.userId())
                  .andWhere({deleted: false});
              });
          });

        if (includeUnpublished) {
          dbQuery.union(() => {
            this.select(columns)
              .from("hackathons")
              .where({"is_published": false});
          });
        }

        if (includeDeleted) {
          dbQuery.union(() => {
            this.select(columns)
              .from("hackathons")
              .where({"deleted": true});
          });
        }
        /*eslint-enable no-valid-this */

        const countQuery = db.count("*").from(dbQuery.as("res"));

        reply(paginate(dbQuery, {limit, offset, countQuery}));
      },
      validate: {
        query: paginationWithDeleted
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
          return ensureHackathon(hackathonId);
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
      tags: ["api", "admin"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = ensureHackathon(hackathonId, {checkOwner}).then(() => {
          return db("hackathons")
            .where({id: hackathonId})
            .update({deleted: true});
        }).then(() => {
          return request.generateResponse().code(204);
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
        const isSuperUser = request.isSuperUser();
        // figure out if we should validate if they're an admin
        const ownerId = isSuperUser ? false : request.userId();

        // only superusers can delete/undelete
        // via PUT
        if (!request.isSuperUser()) {
          delete payload.deleted;
        }

        const response = ensureHackathon(hackathonId, {
          checkOwner: ownerId,
          allowDeleted: isSuperUser
        }).then(() => {
          payload.updated_at = new Date();
          return db("hackathons")
            .where({id: hackathonId})
            .update(payload);
        }).then(() => {
          return ensureHackathon(hackathonId);
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
        const ownerId = request.isSuperUser() ? false : request.userId();

        const response = ensureHackathon(hackathonId, {
          allowDeleted: request.isSuperUser(),
          checkPublished: ownerId
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
    method: "POST",
    path: "/hackathons/{hackathonId}/admins/{userId}",
    config: {
      description: "Add an admin to a hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { userId, hackathonId } = request.params;
        const requestorId = request.userId();
        const isSuperUser = request.isSuperUser();
        const whereClause = {
          user_id: userId,
          hackathon_id: hackathonId
        };

        if (requestorId === userId && !isSuperUser) {
          return reply(Boom.forbidden(`Only super users can add themselves as admins`));
        }

        const response = db("hackathon_admins").where(whereClause).then((rows) => {
          if (rows.length > 0) {
            throw Boom.conflict(`User ${userId} is already an admin of this hackathon`);
          }
          return;
        }).then(() => {
          return db("hackathon_admins").insert(whereClause);
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
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
            hackathon_id: hackathonId
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
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
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
