/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { id } from "../data/validation";
import db, { ensureProject } from "../db-connection";

const trackEvent = function (type) {
  return function (request, reply) {
    const { hackathonId, projectId } = request.params;

    const response = ensureProject(hackathonId, projectId).then(() => {
      return db(type).insert({
        user_id: request.userId(),
        project_id: projectId
      });
    }).then(() => {

      let column; 
      if (type === "shares") {
        column = "share_count"; 
      } else if (type === "video_views") {
        column = "video_views";
      } else {
        column = "view_count";
      }
      return db("projects").where("id", "=", projectId).increment(column, 1);

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

        // we'll track user ID from session/token once we have it
        // hardcoding for now
        const userId = request.userId();

        const likeData = {
          user_id: userId,
          project_id: projectId
        };

        const response = ensureProject(hackathonId, projectId).then(() => {
          return db("likes").where(likeData);
        }).then((result) => {
          if (likeData.user_id !== null && result.length > 0) {
            throw Boom.preconditionFailed(`User ${userId} has already liked project ${projectId}`);
          }
        }).then(() => {
          return db("likes").insert(likeData);
        }).then(() => {
          return db("projects").where("id", "=", projectId).increment("like_count", 1);
        }). then(() => {
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
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}/likes",
    config: {
      description: "Unlike a project. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureProject(hackathonId, projectId).then(() => {
          return db("likes").where({
            user_id: request.userId(),
            project_id: projectId
          })
          .del();
        }).then((res) => {
          if (res !== 0) {
            return db("projects").where({id: projectId}).decrement("like_count", 1);
          }
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
    path: "/hackathons/{hackathonId}/projects/{projectId}/videoviews",
    config: {
      description: "Track views of a project video. No body or query params required.",
      tags: ["api", "action", "stats"],
      handler: (request, reply) => {
          const { hackathonId, projectId } = request.params;
          const response = ensureProject(hackathonId, projectId).then(() => {
              return db('projects').where({
                  id: projectId
              }).then(res => {
                  if (res !== 0) {
                      return db('projects').where({id: projectId}).increment("video_views", 1);
                  }
              }).then(() => {
                  return request.generateResponse().code(204);
              });
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
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/liked",
    config: {
      description: "Return whether the current user has liked a project",
      notes: "Returns \`true\` or \`false\`.",
      tags: ["api", "action", "stats"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureProject(hackathonId, projectId)
          .then(() => {
            return db("likes")
              .where({
                user_id: request.userId(),
                project_id: projectId
              })
              .count("* as count")
              .then((rows) => rows[0].count > 0);
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
