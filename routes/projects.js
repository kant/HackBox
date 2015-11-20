/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { pagination, newProject, projectUpdate, id } from "../data/validation";
import db, { paginate, resolveOr404, ensureHackathon, ensureProject } from "../db-connection";
import Joi from "joi";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Fetch all projects",
      tags: ["api", "paginated", "list", "filterable"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const response = ensureHackathon(hackathonId).then(() => {
          const { query } = request;
          const dbQuery = db("projects").orderBy("created_at", "desc");

          if (query.search) {
            dbQuery
              .where("title", "like", `%${query.search}%`)
              .orWhere("tags", "like", `%${query.search}%`)
              .orWhere("tagline", "like", `%${query.search}%`);
          }

          return paginate(dbQuery, query.limit, query.offset);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: pagination.keys({
          search: Joi.string()
        })
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Create a new project",
      notes: "Only admins can set `owner_id` to something other than self.",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const payload = request.payload;
        const userId = request.userId();

        // always set the hackathon_id from the URL
        payload.hackathon_id = request.params.hackathonId;
        payload.created_at = new Date();
        payload.updated_at = new Date();

        // make sure they don't create projects owned by other people
        // unless they're super users
        if (payload.owner_id && payload.owner_id !== userId && !request.isSuperUser()) {
          return reply(Boom.forbidden("You're not authorized to create projects for other people"));
        }

        // set the owner id to user if blank
        if (!payload.owner_id) {
          payload.owner_id = userId;
        }

        const response = ensureHackathon(hackathonId).then(() => {
          return db("projects").insert(payload);
        }).then((result) => {
          return db("projects").where({id: result[0]});
        }).then((result) => {
          return request.generateResponse(result[0]).code(201);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        payload: newProject
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{projectId}",
    config: {
      description: "Delete a project",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;
        const ownerId = request.isSuperUser() ? false : request.userId();

        const response = ensureProject(hackathonId, projectId, {checkOwner: ownerId}).then(() => {
          return db("projects").where({id: projectId, hackathon_id: hackathonId}).del();
        }).then((result) => {
          if (result === 0) {
            return Boom.notFound(`Project id ${projectId} not found in hackathon ${hackathonId}`);
          } else {
            return request.generateResponse().code(204);
          }
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
    method: "PUT",
    path: "/hackathons/{hackathonId}/projects/{projectId}",
    config: {
      description: "Edit project details",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;
        const projectObj = {
          id: projectId,
          hackathon_id: hackathonId
        };
        const ownerId = request.isSuperUser() ? false : request.userId();
        const { payload } = request;
        payload.updated_at = new Date();

        const response = ensureProject(hackathonId, projectId, {checkOwner: ownerId}).then(() => {
          return db("projects")
            .where(projectObj)
            .update(payload);
        }).then(() => {
          return db("projects").where(projectObj);
        }).then((result) => {
          return result[0];
        });

        reply(response);
      },
      validate: {
        payload: projectUpdate,
        params: {
          hackathonId: id,
          projectId: id
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}",
    config: {
      description: "Fetch details about a single project",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
          return db("projects").where({id: projectId});
        });

        reply(resolveOr404(response, "project"));
      },
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
  name: "projects",
  version: "1.0.0"
};

export default { register };
