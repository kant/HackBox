/*eslint no-process-exit: 0*/

require("babel/register");
const db = require("./config").db;
const client = require("./db-connection").default;

const resetDb = () => {
  client
    .raw(`DROP DATABASE ${db.connection.database}`)
    .then(() => {
      return client.raw(`CREATE DATABASE ${db.connection.database}`);
    })
    .then(() => {
      process.exit();
    });
};

resetDb();
