/*eslint camelcase: [2, {"properties": "never"}] */
import db from "../db-connection";
import {id} from "../data/validation";

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
          db("users")
            .select(db.raw("count(distinct country) as countries"))
            .whereNot({deleted: true}),
          db("users")
            .select(db.raw("count(distinct city) as cities"))
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

  server.route({
    method: "GET",
    path: "/oneweekstats/{hackathonId}",
    config: {
      description: "Get global statistics for oneweek hackathon",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const response = Promise.all([
          db("projects").count().as("value").where({hackathon_id: hackathonId}).whereNot({deleted: true}),
          db("users").join('participants', function() {
              this.on('users.id', '=', 'participants.user_id').andOn('participants.hackathon_id', '=', hackathonId);
          }).select('users.id', 'users.country', 'users.city').countDistinct('users.country as country').countDistinct('users.city as city').countDistinct('users.id as id')          
        ]).then(([projects, users]) => {
          return {
            users: users[0].id,
            cities: users[0].city,
            countries: users[0].country,
            projects: projects[0]['count(*)']
          };
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

  next();
};

register.attributes = {
  name: "global-stats",
  version: "1.0.0"
};

export default { register };