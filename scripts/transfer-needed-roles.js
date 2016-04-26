/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";

/* Migrate data from projects.needed_role to projects.json_needed_roles */
require("babel/register");
const client = require("../db-connection").default;
const Promise = require("bluebird");

const inserts = [];

const updateProject = (project) => {
  const val = project.needed_role.length > 0 ? [project.needed_role] : [];
  return client.update({json_needed_roles: JSON.stringify(val)})
    .into("projects")
    .where("id", project.id);
};

client("projects")
  .select("id", "needed_role")
  .then((projects) => {
    for (const project of projects) {
      inserts.push(updateProject(project));
    }
    return Promise.all(inserts)
    .then(() => {
      console.log("Success!");
      process.exit();
    });
  });
