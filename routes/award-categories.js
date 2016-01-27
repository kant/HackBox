/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import _ from "lodash";
import { id, newAwardCategory, awardCategoryUpdate } from "../data/validation";
import db, { ensureHackathon, ensureAwardCategory } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/award_categories",
    config: {
      description: "Fetch all award categories for a hackathon",
      tags: ["api", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const getAwardCategoriesQuery = db("award_categories")
          .select("*")
          .where({hackathon_id: hackathonId})
          .orderBy("award_categories.name", "asc");
        const response = getAwardCategoriesQuery
          .then((awardCategories) => {
            const [children, parents] = _.partition(awardCategories, "parent_id");
            const childrenByParentId = _.groupBy(children, "parent_id");
            return _.map(parents, (parent) => {
              parent.children = childrenByParentId[parent.id];
              return parent;
            });
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
    path: "/hackathons/{hackathonId}/award_categories",
    config: {
      description: "Add an award category",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const payload = request.payload;
        const parentId = payload.parent_id;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        payload.hackathon_id = hackathonId;

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          parentId ? ensureAwardCategory(hackathonId, parentId) : null
        ])
          .then((result) => {
            if (parentId && result[1].parent_id !== null) {
              throw Boom.forbidden(`Award Categories can only be two levels deep`);
            }
            return db("award_categories").insert(payload);
          })
          .then((result) => {
            const awardCategoryId = result[0];
            return ensureAwardCategory(hackathonId, awardCategoryId);
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
        payload: newAwardCategory
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/award_categories/{awardCategoryId}",
    config: {
      description: "Fetch details about a single award award category",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId, awardCategoryId } = request.params;

        const response = ensureAwardCategory(hackathonId, awardCategoryId);

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardCategoryId: id
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}/award_categories/{awardCategoryId}",
    config: {
      description: "Edit an award",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardCategoryId } = request.params;
        const payload = request.payload;

        const checkOwner = request.isSuperUser() ? false : request.userId();

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAwardCategory(hackathonId, awardCategoryId)
        ])
          .then(() => {
            return db("award_categories")
              .update(payload)
              .where({hackathon_id: hackathonId, id: awardCategoryId});
          })
          .then(() => {
            return ensureAwardCategory(hackathonId, awardCategoryId);
          });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          awardCategoryId: id
        },
        payload: awardCategoryUpdate
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/award_categories/{awardCategoryId}",
    config: {
      description: "Delete an award category",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, awardCategoryId } = request.params;
        const checkOwner = request.isSuperUser() ? false : request.userId();

        const childrenQuery = db("award_categories")
          .select("id")
          .where({parent_id: awardCategoryId});

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAwardCategory(hackathonId, awardCategoryId),
          childrenQuery
        ])
        .then((results) => {
          const childrenIds = _.pluck(results[2], "id");
          const destroyAwardCategoryIds = (childrenIds || []).concat(awardCategoryId);
          return db("award_categories")
            .whereIn("id", destroyAwardCategoryIds)
            .del()
            .then(() => {
              return destroyAwardCategoryIds;
            });
        })
        .then((destroyAwardCategoryIds) => {
          return db("awards_award_categories")
            .whereIn("award_category_id", destroyAwardCategoryIds)
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
          awardCategoryId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "awards_categories",
  version: "1.0.0"
};

export default { register };
