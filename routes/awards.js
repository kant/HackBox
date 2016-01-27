/*eslint camelcase: [2, {"properties": "never"}] */
import _ from "lodash";
import { id, newAward, awardUpdate, pagination } from "../data/validation";
import db, { ensureHackathon, ensureAward, paginate,
  addAwardProjectsToPagination } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/awards",
    config: {
      description: "Fetch all awards for a hackathon",
      tags: ["api", "list"],
      handler(request, reply) {
        const { limit, offset } = request.query;
        const { hackathonId } = request.params;

        const getAwardsQuery = db("awards")
          .select("*")
          .where({hackathon_id: hackathonId})
          .orderBy("awards.name", "asc");
        const response = addAwardProjectsToPagination(paginate(getAwardsQuery, {limit, offset}));

        reply(response);
      },
      validate: {
        query: pagination,
        params: {
          hackathonId: id
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/awards",
    config: {
      description: "Add an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const payload = request.payload;
        const awardCategories = payload.award_categories;
        delete payload.award_categories;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        payload.hackathon_id = hackathonId;

        let awardId;
        const response = ensureHackathon(hackathonId, {checkOwner})
          .then(() => {
            return db("awards").insert(payload);
          }).then((awards) => {
            awardId = awards[0];
            if (awardCategories) {
              const inserts = _.map(awardCategories, (awardCategoryId) => ({
                award_id: awardId,
                award_category_id: awardCategoryId
              }));
              return db("awards_award_categories").insert(inserts);
            }
          })
          .then(() => {
            return ensureAward(hackathonId, awardId);
          })
          .then((result) => {
            return request.generateResponse(result).code(201);
          });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        payload: newAward
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/awards/{awardId}",
    config: {
      description: "Fetch details about a single award",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId, awardId } = request.params;

        const response = ensureAward(hackathonId, awardId);

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardId: id
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}/awards/{awardId}",
    config: {
      description: "Edit an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardId } = request.params;
        const payload = request.payload;
        const awardCategories = payload.award_categories;
        delete payload.award_categories;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId)
        ]).then(() => {
          return db("awards")
            .update(payload)
            .where({id: awardId});
        }).then(() => {
          if (awardCategories) {
            return db("awards_award_categories")
              .where({award_id: awardId})
              .del()
              .then(() => {
                const inserts = _.map(awardCategories, (awardCategoryId) => ({
                  award_id: awardId,
                  award_category_id: awardCategoryId
                }));
                return db("awards_award_categories").insert(inserts);
              });
          }
        })
        .then(() => {
          return ensureAward(hackathonId, awardId);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardId: id
        },
        payload: awardUpdate
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/awards/{awardId}",
    config: {
      description: "Delete an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId)
        ]).then(() => {
          return db("awards")
            .where({id: awardId})
            .del();
        }).then(() => {
          return db("awards_award_categories")
            .where({award_id: awardId})
            .del();
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "awards",
  version: "1.0.0"
};

export default { register };
