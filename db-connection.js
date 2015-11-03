/*eslint camelcase: [2, {"properties": "never"}] */
import knex from "knex";
import Boom from "boom";
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
