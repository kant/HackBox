/*eslint camelcase: [2, {"properties": "never"}] */
import Joi from "joi";
import Boom from "boom";
import { paginationWithDeleted, role, product,
  optionalId, customerType, country } from "../data/validation";
import { paginate, projectSearch, userSearch } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/project-search",
    config: {
      description: "Filter projects accross all hackathons",
      tags: ["api"],
      handler(request, reply) {
        const { limit, offset } = request.query;
        const response = projectSearch(request.query);

        reply(paginate(response, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          has_video: Joi.boolean(),
          needs_hackers: Joi.boolean(),
          needed_role: role,
          needed_expertise: Joi.string(),
          product_focus: product,
          hackathon_id: optionalId,
          customer_type: customerType,
          country
        })
      }
    }
  });

  server.route({
    method: "GET",
    path: "/user-search",
    config: {
      description: "Search users",
      tags: ["api"],
      handler(request, reply) {
        const { query } = request;
        const { limit, offset } = query;
        const gotHasProjectParam = query.has_project === true || query.has_project === false;

        if (gotHasProjectParam && !query.hackathon_id) {
          return reply(Boom.badRequest("cannot specify 'has_project' without a 'hackathon_id'"));
        }
        const response = userSearch(request.query);

        reply(paginate(response, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          hackathon_id: optionalId,
          has_project: Joi.boolean(),
          product_focus: product,
          role,
          country
        })
      }
    }
  });

  next();
};

register.attributes = {
  name: "global-search",
  version: "1.0.0"
};

export default { register };
