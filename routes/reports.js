/*eslint camelcase: [2, {"properties": "never"}] */
/*eslint no-invalid-this: 0*/
import Boom from "boom";
import Joi from "joi";
import { newHackathon, hackathonUpdate, id,
  stringId, pagination, paginationWithDeleted, countryArray,
  sortDirection } from "../data/validation";
import db, { paginate, ensureHackathon, hackathonSearch, getHackathonCities, getHackathonReport }
  from "../db-connection";

const register = function (server, options, next) {

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/reports",
    config: {
      description: "Fetch detailed participant report for hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
          const { query } = request;
          const { limit, offset } = query;

          // make sure we limit search to within this hackathon
          query.hackathon_id = hackathonId;

          return paginate(getHackathonReport(query), {limit, offset});
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: pagination
      }
    }
  });

  server.route({
    method: "GET",
    path: "/reports/{email}",
    config: {
      description: "Fetch MS Graph report for given email address",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { email } = request.params;
        const isSuperUser = request.isSuperUser();
        if (!isSuperUser) {
          throw Boom.forbidden("You must be a super user to access this data.");
        }

        const response = db("reports")
          .select("json_reporting_data")
          .where({email});

        reply(response);
      },
      validate: {
        params: {
          email: Joi.string().email()
        },
      }
    }
  });

  next();
};

register.attributes = {
  name: "reports",
  version: "1.0.0"
};

export default { register };
