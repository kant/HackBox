/*eslint camelcase: [2, {"properties": "never"}] */
import db from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/stats",
    config: {
      description: "Get global statistics",
      tags: ["api"],
      handler(request, reply) {
        const response = Promise.all([
          db("users").count().whereNot({deleted: true}),
          db("hackathons").count().whereNot({deleted: true}),
          db("projects").count().as("value").whereNot({deleted: true}),
          db("hackathons")
            .select(db.raw("count(distinct \"country\") as countries"))
            .whereNot({deleted: true}),
          db("hackathons")
            .select(db.raw("count(distinct \"cities\") as cities"))
            .whereNot({deleted: true})
        ]).then(([users, hackathons, projects, countries, cities]) => {
          const key = "count(*)";
          return {
            users: users[0][key],
            hackathons: hackathons[0][key],
            projects: projects[0][key],
            countries: countries[0].countries,
            cities: cities[0].cities
          };
        });

        reply(response);
      }
    }
  });

  next();
};

register.attributes = {
  name: "global-stats",
  version: "1.0.0"
};

export default { register };
