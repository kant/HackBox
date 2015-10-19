import Boom from "boom";
import { pagination, newProject, project, id } from "../data/schemas";

function register(server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathon/{hackathon_id}/projects",
    config: {
      description: "Fetch all projects",
      tags: ["paginated", "list"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
        },
        query: pagination,
      },
    },
  });

  server.route({
    method: "POST",
    path: "/hackathon/{hackathon_id}/projects",
    config: {
      description: "Create a new project",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
        },
        payload: newProject,
      },
    },
  });

  server.route({
    method: "DELETE",
    path: "/hackathon/{hackathon_id}/projects/{id}",
    config: {
      description: "Delete a project",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          id,
        },
      },
    },
  });

  server.route({
    method: "PUT",
    path: "/hackathon/{hackathon_id}/projects/{id}",
    config: {
      description: "Edit project details",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: project,
        params: {
          hackathon_id: id,
          id,
        },
      },
    },
  });

  server.route({
    method: "GET",
    path: "/hackathon/{hackathon_id}/projects/{id}",
    config: {
      description: "Fetch details about a single project",
      tags: ["detail"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathon_id: id,
          id,
        },
      },
    },
  });

  next();
}

register.attributes = {
  name: "projects",
  version: "1.0.0",
};

export default { register };
