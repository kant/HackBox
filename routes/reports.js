/*eslint
  camelcase: [2, {"properties": "never"}],
  no-invalid-this: 0,
  max-statements: [2, 16]
*/
import _ from "lodash";
import Boom from "boom";
import Joi from "joi";
import { id, pagination } from "../data/validation";
import db, { clientReplica, ensureHackathon, ensureHackathonReports, getHackathonReport, getHackathonGeneralReport, paginate, addTagsToPaginationReports }
  from "../db-connection";
import hbLogger from "../hbLogger";

const register = function (server, options, next) {

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/reports",
    config: {
      description: "Fetch detailed participant report for hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        // ensureHackathon will force to query the master DB, not replica 4/10/17
        // It's used in other API endpoints that cannot use the replica.
        const response = ensureHackathonReports(hackathonId)
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
    path: "/hackathons/{hackathonId}/generalreports/reports",
    config: {
      description: "Fetch detailed participant report for non One Week hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathonReports(hackathonId)
        .then(() => {
          const { query } = request;
          const { limit, offset } = query;

          // make sure we limit search to within this hackathon
          query.hackathon_id = hackathonId;

          return paginate(getHackathonGeneralReport(query), {limit, offset});
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

  const addTeamDataToPagination = (paginationQuery) => {
    return paginationQuery.then((paginated) => {
      const projectIds = _.pluck(paginated.data, "project_id");
      const teamQuery = clientReplica("members")
        .select("members.project_id", "users.email")
        .distinct()
        .join("users", "users.id", "members.user_id")
        .whereIn("project_id", projectIds);
      return teamQuery.then((teams) => {
        teams = _.groupBy(teams, "project_id");
        paginated.data = _.map(paginated.data, (entry) => {
          const team = teams[entry.project_id];
          entry.team_size = team ? team.length : 0;
          entry.team_emails = team ? _.pluck(team, "email") : {};
          return entry;
        });

        return paginated;
      });
    });
  };

  const addOwnersToPagination = (paginationQuery) => {
    try {
        hbLogger.info(`reports - addOwnersToPagination`);
        return paginationQuery.then((paginated) => {
            const ownerIds = _.pluck(paginated.data, "owner_id");
            const ownersQuery = clientReplica("users")
                .select("users.id as owner_id", "users.name as owner_name", "users.alias as owner_alias")
                .distinct()
                .whereIn("users.id", ownerIds);

            return ownersQuery.then((owners) => {
                owners = _.groupBy(owners, "owner_id");
                paginated.data = _.map(paginated.data, (entry) => {
                    const owner = owners[entry.owner_id];
                    // consol.log(owner);
                    entry.owner_name = owner ? _.pluck(owner, "owner_name") : {};
                    entry.owner_alias = owner ? _.pluck(owner, "owner_alias") : {};
                    return entry;
                });
                return paginated;
            });
        });
    }
    catch (e) {
       hbLogger.error(`reports - addOwnersToPagination exception: ${e.message}`);
    }
  };

  // const addReportsToPagination = (paginationQuery) => {
  //   // Background: We use 'alias' because it's the only data in a user profile that matches an entry in reports.
  //   // Think of alias as 'email' in this case. Using 'email' would produce incorrect output due to differences
  //   // between an FTE's contact info.
  //   return paginationQuery.then((paginated) => {
  //     const emails = _.pluck(paginated.data, "alias");
  //     const reportsQuery = db("reports")
  //       .select("email", "json_reporting_data")
  //       .whereIn("email", emails)
  //       .groupBy("email");

  //     return reportsQuery.then((reports) => {
  //       reports = _.groupBy(reports, "email");
  //       paginated.data = _.map(paginated.data, (entry) => {
  //         entry.json_reporting_data = reports[entry.alias] ?
  //         reports[entry.alias][0].json_reporting_data : "{}";
  //         return entry;
  //       });
  //       return paginated;
  //     });
  //   });
  // };

  const cleanUpUser = (user) => {
    user.role = user.owner_id === user.user_id ? "Project Owner" : "Team Member";
    user.project_url = [
      "https://garagehackbox.azurewebsites.net/hackathons/",
      `${user.hackathon_id}/projects/${user.project_id}`
    ].join("");
    user.page_view_count = user.view_count;
    delete user.view_count;
    delete user.deleted;
    delete user.product_focus;
    delete user.user_id;
    delete user.project_id;
    delete user.id;
    delete user.hackathon_id;
    return user;
  };

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/project-reports",
    config: {
      description: "Fetch detailed participant report for all projects in a hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathonReports(hackathonId)
        .then(() => {
          const { query } = request;
          const { limit, offset } = query;
          const members = clientReplica("members")
            .select([
              "users.alias as alias",
              "users.email as email",
              "users.name as hb_name",
              "users.city as hb_city",
              "users.country as hb_country",
              "users.json_expertise as json_expertise",
              "users.json_interests as json_interests",
              "users.json_working_on as json_working_on",
              "members.user_id as user_id",
              "members.project_id as project_id",
              "members.joined_at as registration_date",
              "participants.json_participation_meta as json_participation_meta",
              "video_views.views as video_views",
              "projects.*",
              "reports.json_reporting_data as json_reporting_data"
            ])
            .innerJoin("users", "users.id", "members.user_id")
            .innerJoin("projects", "projects.id", "members.project_id")
            .leftJoin("reports", "users.alias", "reports.email")
            .leftJoin("video_views", "members.project_id", "video_views.project_id")
            .leftJoin("participants", "users.id", "participants.user_id")
            .where({
              "members.hackathon_id": hackathonId,
              "projects.deleted": false,
              "participants.hackathon_id": hackathonId})
            .orderBy("participants.joined_at")
            .orderBy("projects.title");
          return addTeamDataToPagination(
                addOwnersToPagination(
              addTagsToPaginationReports(
                paginate(members, {limit, offset}))))
            .then((paginated) => {
              paginated.data = _.map(paginated.data, cleanUpUser);
              return paginated;
            });
        });
        
        return reply(response);
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
    path: "/hackathons/{hackathonId}/generalreports/project-reports",
    config: {
      description: "Fetch participant report for all projects in a hackathon",
      tags: ["api", "detail", "paginated", "list"],
      handler(request, reply) {
        const { hackathonId } = request.params;

        const response = ensureHackathonReports(hackathonId)
        .then(() => {
          const { query } = request;
          const { limit, offset } = query;
          const members = clientReplica("members")
            .select([
              "users.alias as alias",
              "users.email as email",
              "users.name as hb_name",
              "users.city as hb_city",
              "users.country as hb_country",
              "users.json_expertise as json_expertise",
              "users.json_interests as json_interests",
              "users.json_working_on as json_working_on",
              "members.user_id as user_id",
              "members.project_id as project_id",
              "members.joined_at as registration_date",
              "participants.json_participation_meta as json_participation_meta",
              "video_views.views as video_views",
              "projects.*",
              "reports.json_reporting_data as json_reporting_data"
            ])
            .innerJoin("users", "users.id", "members.user_id")
            .innerJoin("projects", "projects.id", "members.project_id")
            .leftJoin("reports", "users.alias", "reports.email")
            .leftJoin("video_views", "members.project_id", "video_views.project_id")
            .leftJoin("participants", "users.id", "participants.user_id")
            .where({
              "members.hackathon_id": hackathonId,
              "projects.deleted": false,
              "participants.hackathon_id": hackathonId})
            .orderBy("participants.joined_at")
            .orderBy("projects.title");
          return addTeamDataToPagination(
                addOwnersToPagination(
              addTagsToPaginationReports(
                paginate(members, {limit, offset}))))
            .then((paginated) => {
              paginated.data = _.map(paginated.data, cleanUpUser);
              return paginated;
            }).catch(e => {
                hbLogger.error(`project-reports: exception: ${e.message}`);
            });
        });
        
        return reply(response);
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

        const response = clientReplica("reports")
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
