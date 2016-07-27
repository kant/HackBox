/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { paginationWithDeleted, newProject, stringId, neededExpertiseArray,
  roleArray, productArray, projectUpdate, id, customerTypeArray,
  sortDirection, arrayOfStrings, voteCategoryId } from "../data/validation";
import db, {
  paginate, ensureHackathon, ensureProject, projectSearch,
  addProjectMembersToPagination, addProjectUrlsToPagination,
  addProjectTags, addTagsToPagination, addOrUpdateProjectTags
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

        reply(
          addProjectMembersToPagination(
            addTagsToPagination(
              addProjectUrlsToPagination(
                paginate(response, {limit, offset}),
                request.params.hackathonId),
              "id")
            )
          );
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: paginationWithDeleted.keys({
          search: Joi.string(),
          search_array: arrayOfStrings,
          has_video: Joi.boolean(),
          needs_hackers: Joi.boolean(),
          writing_code: Joi.boolean(),
          existing: Joi.boolean(),
          external_customers: Joi.boolean(),
          needed_roles: roleArray,
          needed_expertise: neededExpertiseArray,
          product_focus: productArray,
          customer_type: customerTypeArray,
          has_member: stringId,
          has_challenges: arrayOfStrings,
          venue: arrayOfStrings,
          participant_name: Joi.string(),
          video_type: Joi.string(),
          sort_col: Joi.any()
          .valid("created_at", "title", "like_count", "share_count", "view_count", "comment_count",
            "tagline", "owner_alias"),
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
    method: "PUT",
    path: "/hackathons/{hackathonId}/projects/{projectId}/tags/{tags}",
    config: {
      description: "Tag a project with arbitrary strings. Replaces project's current tags.",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId, tags } = request.params;

        const response = ensureProject(hackathonId, projectId)
          .then(() => {
            return addOrUpdateProjectTags(projectId, tags);
          })
          .then(() => {
            return db("project_tags")
            .select("json_tags")
            .where({project_id: projectId});
          })
          .then((res) => {
            return request.generateResponse(res[0]).code(200);
          });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id,
          tags: arrayOfStrings.description("Array of strings to tag this project with")
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{projectId}/tags",
    config: {
      description: "Get a project's special tags",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId} = request.params;

        const response = ensureProject(hackathonId, projectId)
          .then(() => {
            return db("project_tags")
            .select("json_tags")
            .where({project_id: projectId});
          })
          .then((res) => {
            const result = res[0] ? res[0] : {json_tags: "[]"};
            return request.generateResponse(result).code(200);
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
    path: "/hackathons/{hackathonId}/projects/{projectId}",
    config: {
      description: "Fetch details about a single project",
      tags: ["api", "detail"],
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureProject(hackathonId, projectId, {
          allowDeleted: request.isSuperUser(),
          includeOwner: true
        }).then((project) => {
          return addProjectTags(project);
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
    path: "/hackathons/{hackathonId}/projects/{projectId}/vote",
    config: {
      description: "Submit a vote for this project in the given category",
      tags: ["api"],
      handler(request, reply) {
        const { hackathonId, projectId} = request.params;
        const voteCategory = request.payload.vote_category;
        const oid = request.userId();
        const vote = {
          oid,
          hackathon_id: hackathonId,
          project_id: projectId,
          vote_category: voteCategory
        };

        const response = db.transaction((trx) => {
          return trx("votes")
            .insert(vote)
            .then(() => {
              const colName = `vote_count_${voteCategory}`;
              return trx("projects")
                .increment(colName, 1)
                .where({id: projectId})
                .then(() => {
                  return request.generateResponse(vote).code(201);
                });
            },
            (err) => {
              if (err.code === "ER_DUP_ENTRY") {
                return request.generateResponse(["Duplicate vote ", JSON.stringify(vote)].join(""))
                .code(409);
              } else {
                return request.generateResponse(err).code(503);
              }
            });
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id,
          projectId: id
        },
        payload: {
          vote_category: voteCategoryId
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
