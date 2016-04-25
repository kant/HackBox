/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";

/* Migrate data from projects.needed_role to projects.json_needed_roles */
require("babel/register");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const Promise = require("bluebird");

const inserts = [];

const updateProject = (project) => {
  return client.update({json_needed_roles: JSON.stringify([project.needed_role])})
    .into("projects")
    .where("id", project.id);
};

client("projects")
  .select("id", "needed_role")
  .then((projects) => {
    for (let project of projects) {
      inserts.push(updateProject(project));
    }
    return Promise.all(inserts)
    .then(() => {
      console.log("Success!");
      process.exit();
    });
  });
