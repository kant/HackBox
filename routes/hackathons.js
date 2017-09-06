/*eslint camelcase: [2, {"properties": "never"}] */
/*eslint no-invalid-this: 0*/
import Boom from "boom";
import Joi from "joi";
import { newHackathon, hackathonUpdate, id,
  stringId, paginationWithDeleted, countryArray,
  sortDirection } from "../data/validation";
import db, { paginate, ensureHackathon, hackathonSearch, getHackathonCities }
  from "../db-connection";

import admin from "../data/approved-admins";
import appInsights from "applicationinsights";

const client = appInsights.getClient();

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons",
    config: {
      description: "Fetch all hackathons",
      notes: [
        `The 'admins_contain' query paramater can either be a `,
        `user ID or the string 'me' as an alias to fetch your own.<br/><br/>`,
        `Note that anytime you want to include unpublished entries `,
        `you have to specify the \`include_unpublished=true\` as well.`,
        `So to list all of your own including unpublished you'd do: `,
        `\`GET /hackathons?admins_contain=me&include_unpublished=true\`.<br/><br/>`,
        `Only super users can request \`include_unpublished\` for users `,
        `who are not themselves.`
      ].join(""),
      tags: ["api", "paginated", "list"],
      handler(request, reply) {
        const { limit, offset } = request.query;
        let requestorId = request.userId();
        const adminsContain = request.query.admins_contain;

        // allow users to pass `me` instead of full user ID
        // if they're just wanting to see their own hackathons
        if (adminsContain === "me") {
          request.query.admins_contain = requestorId;
        }

        // Checks approved admins who can view all hacks in admin portal
        if (admin[requestorId] && adminsContain === 'me') {
          request.query.admins_contain = undefined;
        }

        const askingForOwn = request.query.admins_contain === requestorId;

        //Turned it off unless we will write better authorization then 'Bearer super''
        // if (request.query.include_unpublished) {
        //   if (!request.isSuperUser() && !askingForOwn) {
        //     return reply(Boom.forbidden(`Can only request your own unpublished unless admin`));
        //   }
        // }

        if (request.auth.credentials && request.auth.credentials.organization_id) {
          request.query.organization_id = request.auth.credentials.organization_id;
        }

        const response = hackathonSearch(request.query);

        reply(paginate(response, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          admins_contain: Joi.string(),
          participants_contain: Joi.string(),
          country: countryArray,
          sort_col: Joi.any().valid("start_at", "end_at", "name", "tagline",
            "city", "country", "projects", "participants", "status"),
          sort_direction: sortDirection
        })
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
        const { payload } = request;

        const now = new Date();

        payload.created_at = now;
        payload.updated_at = now;

        // Use transaction to insert hackathon and
        // corresponding entry in admins table
        const response = db.transaction((trx) => {
          return trx
            .insert(payload)
            .into("hackathons")
            .then((rows) => {
              hackathonId = rows[0];
              return trx("hackathon_admins").insert({
                hackathon_id: hackathonId,
                user_id: ownerId
              });
            });
        }).then(() => {
          //Always on hackathon creation make this hack belong to Microsoft organization
          return db("hackathons_orgs").insert({
            hackathon_id: hackathonId,
            organization_id: 1
          });
        }).then(() => {
          client.trackEvent("New Hackathon", {hackId: hackathonId});
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
          client.trackEvent("Hack Updated", {hackId: hackathonId});
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
        var hackathon = {};

        const response = ensureHackathon(hackathonId, {
          allowDeleted: request.isSuperUser(),
          checkPublished: ownerId
        })
        .then((hack) => {
          hackathon = hack;

          //Check if hackathon belongs to the same organization as user
          return db("hackathons_orgs")
            .where({hackathon_id: hack.id})
        })
        .then((data) => {
          var authorized = false;

          data.forEach((hack) => {
            if (hack.organization_id == request.auth.credentials.organization_id) {
              authorized = true;
            }
          });

          if (authorized) {
            reply(hackathon);
          } else {
            reply().code(403);
          }
        })
        .catch((err) => {
            reply(err);
          });

      },
      validate: {
        params: {
          hackathonId: id
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/cities",
    config: {
      description: "Fetch counts of participants' cities for a single hackathon",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const ownerId = request.isSuperUser() ? false : request.userId();

        ensureHackathon(hackathonId, {
          allowDeleted: request.isSuperUser(),
          checkPublished: ownerId
        });

        reply(getHackathonCities(hackathonId));
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
