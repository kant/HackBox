/*eslint camelcase: [2, {"properties": "never"}] */
import knex from "knex";
import Boom from "boom";
import assert from "assert";
import { db } from "./config";

const client = knex(db);

export default client;

export const resolveOr404 = (promise, label = "resource") => {
  return promise.then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`no such ${label}`);
    } else {
      return rows[0];
    }
  });
};

export const ensureHackathon = (id, opts = {checkOwner: false, allowDeleted: false}) => {
  let hackathonResult;
  return client("hackathons").where({id}).then((rows) => {
    hackathonResult = rows[0];

    // 404 if soft deleted or not found
    if (!hackathonResult || (hackathonResult.deleted && !opts.allowDeleted)) {
      throw Boom.notFound(`No hackathon with id ${id} was found`);
    }
    if (!opts.checkOwner) {
      return hackathonResult;
    }

    // check if they're an admin
    return client("hackathon_admins").where({
      hackathon_id: id,
      owner_id: opts.checkOwner
    }).then((owners) => {
      if (!owners.length) {
        throw Boom.forbidden(`You must be a hackathon admin to do this`);
      }
      return hackathonResult;
    });
  });
};

export const ensureProject = (hackathonId, id, opts = {checkOwner: false}) => {
  return client("projects").where({id}).then((rows) => {
    const project = rows[0];

    if (!project) {
      throw Boom.notFound(`No project ${id} exists.`);
    } else if (project.hackathon_id !== hackathonId) {
      throw Boom.notFound(`No project with id ${id} was found in hackathon ${hackathonId}.`);
    } else if (opts.checkOwner && project.owner_id !== opts.checkOwner) {
      throw Boom.forbidden(`You must be the project owner to modify it`);
    }
    return project;
  });
};

export const ensureComment = (projectId, id, opts = {checkOwner: false}) => {
  return client("comments").where({id}).then((rows) => {
    const comment = rows[0];

    if (!comment) {
      throw Boom.notFound(`No comment ${id} exists.`);
    } else if (comment.project_id !== projectId) {
      throw Boom.notFound(`No comment with id ${id} was found in project ${projectId}.`);
    } else if (opts.checkOwner && comment.user_id !== opts.checkOwner) {
      throw Boom.forbidden(`You must have created the comment to modify it`);
    }
  });
};

export const ensureParticipant = (hackathonId, userId) => {
  return client("participants").where({user_id: userId, hackathon_id: hackathonId}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`User id ${userId} was not found in hackathon ${hackathonId}.`);
    }
  });
};

export const ensureUser = (userId) => {
  return client("users").where({id: userId}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`User id ${userId} was not found.`);
    }
  });
};

export const paginate = (query, limit, offset) => {
  assert(typeof limit === "number", "Must pass a numeric 'limit' to 'paginate' method");
  assert(typeof limit === "number", "Must pass a numeric 'offset' to 'paginate' method");
  return Promise.all([
    query.clone().count(),
    query
      .limit(limit)
      .offset(offset)
  ]).then((res) => {
    const data = res[1];
    return {
      offset,
      limit,
      result_count: data.length,
      total_count: res[0][0]["count(*)"],
      data
    };
  });
};

