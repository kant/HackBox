import Boom from "boom";
import { pagination, newProject, project, id } from "../data/schemas";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects",
    config: {
      description: "Fetch all projects",
      tags: ["paginated", "list", "filterable"],
      handler(request, reply) {
        reply(Boom.notImplemented());
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
        reply(Boom.notImplemented());
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
    path: "/hackathons/{hackathonId}/projects/{id}",
    config: {
      description: "Delete a project",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          id
        }
      }
    }
  });

  server.route({
    method: "PUT",
    path: "/hackathons/{hackathonId}/projects/{id}",
    config: {
      description: "Edit project details",
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        payload: project,
        params: {
          hackathonId: id,
          id
        }
      }
    }
  });

  server.route({
    method: "GET",
    path: "/hackathons/{hackathonId}/projects/{id}",
    config: {
      description: "Fetch details about a single project",
      tags: ["detail"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          id
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{id}/likes",
    config: {
      description: "Like a project. No body or query params required.",
      tags: ["action", "stats"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          id
        }
      }
    }
  });

  server.route({
    method: "DELETE",
    path: "/hackathons/{hackathonId}/projects/{id}/likes",
    config: {
      description: "Unlike a project. No body or query params required.",
      tags: ["action", "stats"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          id
        }
      }
    }
  });

  server.route({
    method: "POST",
    path: "/hackathons/{hackathonId}/projects/{id}/shares",
    config: {
      description: "Track share click on a project. No body or query params required.",
      tags: ["action", "stats"],
      handler(request, reply) {
        reply(Boom.notImplemented());
      },
      validate: {
        params: {
          hackathonId: id,
          id
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
