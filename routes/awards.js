/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import _ from "lodash";
import { id, newAward, awardUpdate, pagination } from "../data/validation";
import db, { ensureHackathon, ensureAward, paginate,
  addAwardProjectsToPagination } from "../db-connection";

const coundValidChildAwardQueries = (hackathonId, awardCategories) => {
  return db("award_categories")
    .whereIn("id", awardCategories)
    .where({hackathon_id: hackathonId})
    .whereNotNull("parent_id")
    .count("id as count")
    .then((result) => result[0].count);
};

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
        const awardCategoryIds = payload.award_category_ids;
        delete payload.award_category_ids;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        payload.hackathon_id = hackathonId;

        let awardId;
        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          awardCategoryIds ? coundValidChildAwardQueries(hackathonId, awardCategoryIds) : null
        ])
          .then((result) => {
            // verify all specified award_category_ids are valid
            if (awardCategoryIds) {
              const awardCategoriesCount = result[1];
              if (awardCategoriesCount !== awardCategoryIds.length) {
                throw Boom.forbidden(`Invalid award categories specified.`);
              }
            }

            return db("awards").insert(payload);
          }).then((awards) => {
            awardId = awards[0];
            // apply award categories
            if (awardCategoryIds) {
              const inserts = _.map(awardCategoryIds, (awardCategoryId) => ({
                award_id: awardId,
                award_category_id: awardCategoryId
              }));
              return db("awards_award_categories").insert(inserts);
            }
          })
          .then(() => {
            return ensureAward(hackathonId, awardId, {includeCategories: true});
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

        const response = ensureAward(hackathonId, awardId, {includeCategories: true});

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

        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId)
        ]).then(() => {
          return db("awards")
            .update(payload)
            .where({hackathon_id: hackathonId, id: awardId});
        })
        .then(() => {
          return ensureAward(hackathonId, awardId, {includeCategories: true});
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
