/*eslint camelcase: [2, {"properties": "never"}] */
import Boom from "boom";
import { pagination, newProject, projectUpdate, id } from "../data/validation";
import db, { resolveOr404, ensureHackathon } from "../db-connection";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Fetch all projects",
      tags: ["paginated", "list", "filterable"],
      handler(request, reply) {
        const { hackathonId } = request.params;
        const response = ensureHackathon(hackathonId).then(() => {
          return db.select()
            .table("projects")
            .where({hackathon_id: request.params.hackathonId})
            .limit(request.query.limit)
            .offset(request.query.offset);
        });

        reply(response);
      },
      validate: {
        params: {
          hackathonId: id
        },
        query: pagination
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Create a new project",
      handler(request, reply) {
        const { hackathonId } = request.params;
        const payload = request.payload;

        // always set the hackathon_id from the URL
        payload.hackathon_id = request.params.hackathonId;

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
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;

        const response = ensureHackathon(hackathonId).then(() => {
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
      handler(request, reply) {
        const { hackathonId, projectId } = request.params;
        const projectObj = {
          id: projectId,
          hackathon_id: hackathonId
        };

        const response = ensureHackathon(hackathonId).then(() => {
          return db("projects")
            .where(projectObj)
            .update(request.payload);
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
      tags: ["detail"],
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
