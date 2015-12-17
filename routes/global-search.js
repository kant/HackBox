/*eslint camelcase: [2, {"properties": "never"}] */
import Joi from "joi";
import { paginationWithDeleted, roleArray, productArray, stringId,
  optionalId, customerTypeArray, countryArray, neededExpertiseArray } from "../data/validation";
import { paginate, projectSearch } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/project-search",
    config: {
      description: "Filter projects accross all hackathons",
      tags: ["api"],
      notes: [
        `The 'has_member' query paramater can either be a `,
        `user ID or the string 'me' as an alias to fetch your own.`
      ].join(""),
      handler(request, reply) {
        const { query } = request;
        const { limit, offset } = query;

        // allow alias "me" for searching for own
        if (query.has_member === "me") {
          query.has_member = request.userId();
        }

        console.log('starting project search')
        const response = projectSearch(query);
        console.log('finished building query')

        reply(paginate(response, {limit, offset}));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          has_video: Joi.boolean(),
          needs_hackers: Joi.boolean(),
          needed_role: roleArray,
          needed_expertise: neededExpertiseArray,
          product_focus: productArray,
          hackathon_id: optionalId,
          customer_type: customerTypeArray,
          has_member: stringId,
          country: countryArray
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
