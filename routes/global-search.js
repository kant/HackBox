/*eslint camelcase: [2, {"properties": "never"}] */
import Joi from "joi";
import { paginationWithDeleted, role, product,
  optionalId, customerType, country } from "../data/validation";
import { paginate, projectSearch } from "../db-connection";

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

  next();
};

register.attributes = {
  name: "global-search",
  version: "1.0.0"
};

export default { register };
