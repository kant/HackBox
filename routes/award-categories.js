/*eslint camelcase: [2, {"properties": "never"}] */
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
            const r = _(children)
              .groupBy("parent_id")
              .toArray()
              .map((group) => {
                const parent = _.find(parents, (p) => p.id === group[0].parent_id);
                return {
                  root: parent,
                  children: group
                };
              })
              .value();
            return r;
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

        const checkOwner = request.isSuperUser() ? false : request.userId();

        payload.hackathon_id = hackathonId;

        const response = ensureHackathon(hackathonId, {checkOwner})
          .then(() => {
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

        const response = Promise.all([
          ensureHackathon(hackathonId, {checkOwner}),
          ensureAwardCategory(hackathonId, awardCategoryId)
        ])
        .then(() => {
          return db("award_categories")
            .where({id: awardCategoryId})
            .del();
        })
        .then(() => {
          return db("awards_award_categories")
            .where({award_category_id: awardCategoryId})
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
