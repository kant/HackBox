/*eslint camelcase: [2, {"properties": "never"}] */
/*eslint no-invalid-this: 0*/
import Boom from "boom";
import Joi from "joi";
import { id, pagination } from "../data/validation";
import db, { ensureHackathon, getHackathonReport, paginate, projectSearch,
  addProjectMemberReportsToPagination }
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
        const isSuperUser = request.isSuperUser();
        const requestorId = request.userId();

        const response = ensureHackathon(hackathonId)
        .then(() => {
          return db("hackathon_admins").where({
            hackathon_id: hackathonId
          });
        })
        .then((adminResults) => {
          if (!isSuperUser && !adminResults.some((admin) => admin.user_id === requestorId)) {
            throw Boom.forbidden(`User ${requestorId} is not an admin of this hackathon`);
          }
        })
        .then(() => {
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
    path: "/hackathons/{hackathonId}/project-reports",
    config: {
      description: "Fetch detailed participant report for all projects in a hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const isSuperUser = request.isSuperUser();
        const requestorId = request.userId();

        ensureHackathon(hackathonId)
        .then(() => {
          return db("hackathon_admins").where({
            hackathon_id: hackathonId
          });
        })
        .then((adminResults) => {
          if (!isSuperUser && !adminResults.some((admin) => admin.user_id === requestorId)) {
            throw Boom.forbidden(`User ${requestorId} is not an admin of this hackathon`);
          }
        })
        .then(() => {
          const { query } = request;
          const { limit, offset } = query;

          // make sure we limit search to within this hackathon
          query.hackathon_id = hackathonId;

          const response = projectSearch(query);

          reply(addProjectMemberReportsToPagination(paginate(response, {limit, offset})));
        });

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
        }
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
