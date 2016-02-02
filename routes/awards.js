/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import _ from "lodash";
import { id, newAward, awardUpdate, pagination } from "../data/validation";
import db, { ensureHackathon, ensureAward, ensureAwardCategory, paginate,
  awardSearch, addAwardProjectsAndCategoriesToPagination } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/awards",
    config: {
      description: "Fetch all awards for a hackathon",
      notes: [
        "If filtering by award category, an array of `award_category_ids` may",
        "be passed as a query parameter. If parent categories are specified,",
        "results will include awards with any child category. A mix of parent",
        "and child categories may be specified."
      ].join(" "),
      tags: ["api", "list"],
      handler(request, reply) {
        const { query } = request;
        const { limit, offset } = query;
        const awardCategoryIds = query.award_category_ids;
        const { hackathonId } = request.params;

        let awardPagination;

        if (awardCategoryIds && awardCategoryIds.length) {
          // given a list of award_category_ids that may be parents or children,
          // find all children categories that should be searched
          const awardCategoryQuery = db("award_categories")
            .select("id", "parent_id")
            .where({hackathon_id: hackathonId})
            .whereRaw("(parent_id is not null and id in (?)) or (parent_id in (?))",
              [awardCategoryIds, awardCategoryIds]);

          awardPagination = awardCategoryQuery
            .then((awardCategories) => {
              // check to make sure all award_category_ids we're filtering on were
              // valid as parents or children for this hackathon
              const awardCategoriesValid = _.every(awardCategoryIds, (categoryId) => {
                return _.some(awardCategories, (category) => {
                  return category.id === categoryId || category.parent_id === categoryId;
                });
              });
              if (!awardCategoriesValid) {
                throw Boom.forbidden("Invalid award_category_ids specified.");
              }

              return paginate(awardSearch(hackathonId, {
                awardCategoryIds: _.pluck(awardCategories, "id")
              }), {limit, offset});
            });
        } else {
          awardPagination = paginate(awardSearch(hackathonId), {limit, offset});
        }

        const response = addAwardProjectsAndCategoriesToPagination(awardPagination);

        reply(response);
      },
      validate: {
        query: pagination.keys({
          award_category_ids: Joi.array().items(Joi.number())
        }),
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
        const newAwardPayload = _.omit(_.cloneDeep(payload), "award_category_ids");
        newAwardPayload.hackathon_id = hackathonId;

        const checkOwner = request.isSuperUser() ? false : request.userId();

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
            return db("awards").insert(newAwardPayload);
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

        const ensureCategoryNotYetAppliedQuery = db("awards_award_categories")
          .where({award_id: awardId, award_category_id: awardCategoryId})
          .count("* as count");

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAward(hackathonId, awardId),
          ensureAwardCategory(hackathonId, awardCategoryId),
          ensureCategoryNotYetAppliedQuery
        ]).then((result) => {
          const awardCategory = result[2];
          if (awardCategory.parent_id === null) {
            throw Boom.forbidden(`Only child award categories can be applied.`);
          }

          const existingCategoryAppliedCount = result[3][0].count;
          if (existingCategoryAppliedCount > 0) {
            throw Boom.forbidden(`Award category ${awardCategoryId} already applied.`);
          }

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
