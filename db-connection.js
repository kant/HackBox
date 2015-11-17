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

export const ensureHackathon = (id) => {
  return client("hackathons").where({id}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`No hackathon with id ${id} was found`);
    }
  });
};

export const ensureProject = (hackathonId, id) => {
  return client("projects").where({id, hackathon_id: hackathonId}).then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`No project with id ${id} was found in hackathon ${hackathonId}.`);
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

