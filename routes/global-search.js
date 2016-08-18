/*eslint camelcase: [2, {"properties": "never"}] */
import Joi from "joi";
import { paginationWithDeleted, roleArray, productArray, stringId,
  optionalId, customerTypeArray, countryArray, neededExpertiseArray,
  focusArray, sortDirection, arrayOfStrings }
  from "../data/validation";
import { paginate, projectSearch, addProjectMembersToPagination } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/project-search",
    config: {
      description: "Filter projects across all hackathons",
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

        const response = projectSearch(query);

        reply(addProjectMembersToPagination(paginate(response, {limit, offset})));
      },
      validate: {
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          search_array: arrayOfStrings,
          has_video: Joi.boolean(),
          needs_hackers: Joi.boolean(),
          writing_code: Joi.boolean(),
          existing: Joi.boolean(),
          external_customers: Joi.boolean(),
          needed_roles: roleArray,
          needed_expertise: neededExpertiseArray,
          product_focus: productArray,
          hackathon_id: optionalId,
          customer_type: customerTypeArray,
          has_member: stringId,
          country: countryArray,
          has_focus: focusArray,
          has_challenges: arrayOfStrings,
          venue: arrayOfStrings,
          participant_name: Joi.string(),
          video_type: Joi.string(),
          sort_col: Joi.any()
          .valid("created_at", "title", "like_count", "share_count", "view_count", "comment_count",
            "video_views"),
          sort_direction: sortDirection
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
