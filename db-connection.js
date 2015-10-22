import knex from "knex";
import Boom from "boom";

const dbConnection = process.env.DB_CONNECTION_JSON;
const dbConnectionString = process.env.DB_CONNECTION_STRING;
let config;

// allow for a full JSON connection config if present
if (dbConnection) {
  config = JSON.parse(dbConnection);
} else if (dbConnectionString) {
  // allow customization of client and
  // connection string via environment variables
  // if they are present.
  config = {
    client: process.env.DB_TYPE || "mysql",
    connection: process.env.DB_CONNECTION_STRING
  };
} else {
  // if none of those things exist, fallback to a
  // sqlite db (just for local dev)
  config = {
    client: "sqlite3",
    connection: {
      filename: "./devdb.sqlite"
    }
  };
}

const db = knex(config);

export default db;

export const getOr404 = (promise, label = "resource") => {
  return promise.then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`no such ${label}`);
    } else {
      return rows[0];
    }
  });
};
