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

export const getHackathon = (id, opts = {allowDeleted: false}) => {
  const participantCount = client.select()
    .count("participants.hackathon_id")
    .from("participants")
    .where("participants.hackathon_id", "=", id)
    .as("participants");
  const projectCount = client.select()
    .count("projects.hackathon_id")
    .from("projects")
    .where("projects.hackathon_id", "=", id)
    .as("projects");

  const whereClause = {
    id,
    deleted: false
  };

  if (opts.allowDeleted) {
    delete whereClause.deleted;
  }

  const mainQuery = client("hackathons")
    .select("*", participantCount, projectCount)
    .from("hackathons")
    .where(whereClause);

  const adminQuery = client("users")
    .select("users.*")
    .join("hackathon_admins", "users.id", "=", "hackathon_admins.user_id")
    .where("hackathon_admins.hackathon_id", id);

  return Promise.all([mainQuery, adminQuery]).then(([hackathonRows, admins]) => {
    const hackathon = hackathonRows[0];
    if (hackathon) {
      hackathon.admins = admins;
    }
    return hackathon;
  });
};

export const ensureHackathon = (id, opts = {checkOwner: false, allowDeleted: false}) => {
  return getHackathon(id, {allowDeleted: opts.allowDeleted}).then((result) => {
    if (!result) {
      throw Boom.notFound(`No hackathon with id ${id} was found`);
    }

    if (!opts.checkOwner) {
      return result;
    }

    const hasOwner = result.admins.some((user) => user.id === opts.checkOwner);

    if (!hasOwner) {
      throw Boom.forbidden(`You must be a hackathon admin to do this`);
    }

    return result;
  });
};

export const ensureProject = (hackathonId, id, opts = {checkOwner: false, allowDeleted: false}) => {
  return client("projects").where({id}).then((rows) => {
    const project = rows[0];

    if (!project || project.deleted && !opts.allowDeleted) {
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

export const ensureUser = (userId, opts = {allowDeleted: false}) => {
  const query = {
    deleted: false,
    id: userId
  };
  if (opts.allowDeleted) {
    delete query.deleted;
  }
  return client("users").where(query).then((rows) => {
    const user = rows[0];
    if (!user || user && user.deleted && !opts.allowDeleted) {
      throw Boom.notFound(`User id ${userId} was not found.`);
    }
    return user;
  });
};

export const ensureParticipant = (hackathonId, userId, opts = {includeUser: false}) => {
  return client("participants").where({user_id: userId, hackathon_id: hackathonId}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`User id ${userId} was not found in hackathon ${hackathonId}.`);
    }
    return rows[0];
  }).then((participant) => {
    if (!opts.includeUser) {
      return participant;
    }

    return ensureUser(userId).then((user) => {
      for (const key in user) {
        participant[key] = user[key];
      }
      return participant;
    });
  });
};

export const paginate = (query, {limit, offset, countQuery}) => {
  assert(typeof limit === "number", "Must pass a numeric 'limit' to 'paginate' method");
  assert(typeof limit === "number", "Must pass a numeric 'offset' to 'paginate' method");
  countQuery = countQuery || query.clone();

  // delete any specific columns mentioned by the query for our count query
  // otherwise we can create a query that MySQL doesn't consider to be valid
  // when we add the `.count()` to it.
  countQuery._statements.some((statement, index) => {
    if (statement.grouping === "columns") {
      countQuery._statements.splice(index, 1);
      return true;
    }
  });

  return Promise.all([
    countQuery.count(),
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

