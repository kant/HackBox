/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { paginationWithDeleted, newProject, projectUpdate, id } from "../data/validation";
import db, { paginate, ensureHackathon, ensureProject } from "../db-connection";
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
        const includeDeleted = request.query.include_deleted;
        const { limit, offset, search } = request.query;
        const response = ensureHackathon(hackathonId).then(() => {
          const dbQuery = db("projects")
            .where(includeDeleted ? {} : {deleted: false})
            .orderBy("created_at", "desc");

          if (search) {
            dbQuery
              .andWhere("title", "like", `%${search}%`)
              .orWhere("tags", "like", `%${search}%`)
              .orWhere("tagline", "like", `%${search}%`);
          }

          return paginate(dbQuery, {limit, offset});
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: paginationWithDeleted.keys({
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
          return db("projects").where({
            id: projectId
          }).update({deleted: true});
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
        const isSuperUser = request.isSuperUser();
        const ownerId = isSuperUser ? false : request.userId();
        const { payload } = request;
        payload.updated_at = new Date();

        // only superusers can delete/undelete
        // via PUT
        if (!isSuperUser) {
          delete payload.deleted;
        }

        const response = ensureProject(hackathonId, projectId, {
          checkOwner: ownerId,
          allowDeleted: isSuperUser
        }).then(() => {
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

        const response = ensureProject(hackathonId, projectId, {
          allowDeleted: request.isSuperUser()
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

  next();
};

register.attributes = {
  name: "projects",
  version: "1.0.0"
};

export default { register };
