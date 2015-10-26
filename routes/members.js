import Boom from "boom";
import { id, newComment } from "../data/validation";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members",
    config: {
      description: "Fetch all members of a project",
      tags: ["list"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members/{memberId}",
    config: {
      description: "Add a member to a projects",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          memberId: id
        },
        payload: newComment
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/members/{memberId}",
    config: {
      description: "Remove a member from a team",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          memberId: id
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "members",
  version: "1.0.0"
};

export default { register };
