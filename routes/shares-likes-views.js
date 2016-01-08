/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import Joi from "joi";
import { id } from "../data/validation";
import db, { ensureProject } from "../db-connection";

const trackEvent = function (type) {
  return function (request, reply) {
    const { hackathonId, projectId } = request.params;

    if (request.query.omit_user && !request.isSuperUser()) {
      return reply(Boom.forbidden("only super users can pass 'omit_user'"));
    }

    const response = ensureProject(hackathonId, projectId).then(() => {
      return db(type).insert({
        user_id: request.query.omit_user ? null : request.userId(),
        project_id: projectId
      });
    }).then(() => {
      return request.generateResponse().code(204);
    });

    reply(response);
  };
};

const register = function (server, options, next) {
  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{projectId}/likes",
    config: {
      description: "Like a project. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        if (request.query.omit_user && !request.isSuperUser()) {
          return reply(Boom.forbidden("only super users can pass 'omit_user'"));
        }

        // we'll track user ID from session/token once we have it
        // hardcoding for now
        const userId = request.userId();

        const likeData = {
          user_id: request.query.omit_user ? null : userId,
          project_id: projectId
        };

        const response = ensureProject(hackathonId, projectId).then(() => {
          return db("likes").where(likeData);
        }).then((result) => {
          if (!request.query.omit_user && result.length > 0) {
            throw Boom.preconditionFailed(`User ${userId} has already liked project ${projectId}`);
          }
        }).then(() => {
          return db("likes").insert(likeData);
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        query: {
          omit_user: Joi.boolean()
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/likes",
    config: {
      description: "Unlike a project. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureProject(hackathonId, projectId).then(() => {
          // we don't really care if the "like" already exists or not
          // we'll just try to delete it and move on
          return db("likes").del({
            user_id: request.userId(),
            project_id: projectId
          });
        }).then(() => {
          return request.generateResponse().code(204);
        });

        reply(response);
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
    path: "/hackathons/{hackathonId}/projects/{projectId}/shares",
    config: {
      description: "Track share click on a project. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler: trackEvent("shares"),
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        query: {
          omit_user: Joi.boolean()
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{projectId}/views",
    config: {
      description: "Track views of a project. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler: trackEvent("views"),
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        query: {
          omit_user: Joi.boolean()
        }
      }
    }
  });

  next();
};

register.attributes = {
  name: "stats",
  version: "1.0.0"
};

export default { register };
