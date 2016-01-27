/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import _ from "lodash";
import { id, newAward, awardUpdate, pagination } from "../data/validation";
import db, { ensureHackathon, ensureAward, ensureAwardCategory, paginate,
  addAwardProjectsAndCategoriesToPagination } from "../db-connection";

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
        const response = addAwardProjectsAndCategoriesToPagination(
          paginate(getAwardsQuery, {limit, offset})
        );

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

        const countValidAwardCategoriesQuery = db("award_categories")
          .whereIn("id", awardCategoryIds)
          .where({hackathon_id: hackathonId})
          .whereNotNull("parent_id")
          .count("* as count");

        let awardId;
        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          awardCategoryIds ? countValidAwardCategoriesQuery : null
        ])
          .then((result) => {
            if (awardCategoryIds) {
              const count = result[1][0].count;
              if (count !== awardCategoryIds.length) {
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

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}/awards/{awardId}/award_categories/{awardCategoryId}",
    config: {
      description: "Add a category to an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardId, awardCategoryId } = request.params;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        const ensureCategoryNotYetApplied = db("awards_award_categories")
          .where({award_id: awardId, award_category_id: awardCategoryId})
          .count("* as count")
          .then((results) => {
            const count = results[0].count;
            if (count > 0) {
              throw Boom.forbidden(`Award category ${awardCategoryId} already applied.`);
            }
          });

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId),
          ensureAwardCategory(hackathonId, awardCategoryId),
          ensureCategoryNotYetApplied
        ]).then(() => {
          return db("awards_award_categories")
            .insert({award_id: awardId, award_category_id: awardCategoryId});
        })
        .then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardId: id,
          awardCategoryId: id
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/awards/{awardId}/award_categories/{awardCategoryId}",
    config: {
      description: "Remove a category from an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardId, awardCategoryId } = request.params;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId)
        ]).then(() => {
          return db("awards_award_categories")
            .where({award_id: awardId, award_category_id: awardCategoryId})
            .del();
        })
        .then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardId: id,
          awardCategoryId: id
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
