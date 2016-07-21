/*eslint camelcase: [2, {"properties": "never"}] */
/*eslint no-invalid-this: 0*/
import { id, idArray, stringIdArray } from "../data/validation";
import db from "../db-connection";

const register = function (server, options, next) {

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/project-batch/{projectIds}",
    config: {
      description: "Fetch details about multiple projects",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectIds } = request.params;
        const query = db("projects")
          .select("*")
          .where("hackathon_id", hackathonId)
          .whereIn("id", projectIds);

        reply(query);
      },
      validate: {
        params: {
          hackathonId: id,
          projectIds: idArray
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/user-batch/{userIds}",
    config: {
      description: "Fetch details multiple users",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { userIds } = request.params;

        const query = db("users")
          .select("*")
          .whereIn("id", userIds);
        reply(query);
      },
      validate: {
        params: {
          userIds: stringIdArray
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "hackbot",
  version: "1.0.0"
};

export default { register };
