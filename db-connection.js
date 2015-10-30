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

export const expandResult = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(expandResult);
  } else {
    for (const key in obj) {
      const split = key.split("json_");
      if (split.length === 2) {
        obj[split[1]] = JSON.parse(obj[key]);
        delete obj[key];
      }
    }
  }
  return obj;
};

export const stringifyKeys = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(stringifyKeys);
  } else {
    for (const key in obj) {
      if (key === "meta" || key === "profile") {
        obj[`json_${key}`] = JSON.stringify(obj[key]);
        delete obj[key];
      }
    }
  }
  return obj;
};
