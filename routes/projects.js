/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { paginationWithDeleted, newProject, stringId, neededExpertiseArray,
  roleArray, productArray, projectUpdate, id, customerTypeArray,
  sortDirection } from "../data/validation";
import db, {
  paginate, ensureHackathon, ensureProject, projectSearch, withProjectMembers
} from "../db-connection";
import Joi from "joi";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Fetch all projects",
      tags: ["api", "paginated", "list", "filterable"],
      notes: [
        `The 'has_member' query paramater can either be a `,
        `user ID or the string 'me' as an alias to fetch your own.`
      ].join(""),
      handler(request, reply) {
        const { query } = request;
        const { limit, offset } = query;

        // hardcode hackathon id to match
        query.hackathon_id = request.params.hackathonId;

        // allow alias "me" for searching for own
        if (query.has_member === "me") {
          query.has_member = request.userId();
        }

        const response = projectSearch(query);

        reply(withProjectMembers(paginate(response, {limit, offset})));
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          has_video: Joi.boolean(),
          needs_hackers: Joi.boolean(),
          needed_role: roleArray,
          needed_expertise: neededExpertiseArray,
          product_focus: productArray,
          customer_type: customerTypeArray,
          has_member: stringId,
          sort_col: Joi.any().valid("created_at", "title"),
          sort_direction: sortDirection
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
        let projectId;

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
          return db.transaction((trx) => {
            return trx("projects")
              .insert(payload)
              .then((results) => {
                // store our project ID
                projectId = results[0];
                return trx("members")
                  .insert({
                    user_id: payload.owner_id,
                    project_id: projectId,
                    hackathon_id: hackathonId
                  });
              });
          });
        }).then(() => {
          return ensureProject(hackathonId, projectId);
        }).then((data) => {
          return request.generateResponse(data).code(201);
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
          checkMember: ownerId,
          allowDeleted: isSuperUser
        }).then(() => {
          return db("projects")
            .where(projectObj)
            .update(payload);
        }).then(() => {
          return ensureProject(hackathonId, projectId);
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
          allowDeleted: request.isSuperUser(),
          includeOwner: true
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
