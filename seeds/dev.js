require("babel/register");
var data = require("../data/mock-data");

exports.seed = function (knex, Promise) {
  return Promise.join(
    knex("hackathons").del(),
    knex("hackathons").insert(data.hackathons),
    knex("projects"),
    knex("projects").insert(data.projects),
    knex("users"),
    knex("users").insert(data.users),
    knex("participants"),
    knex("participants").insert(data.participants),
    knex("members"),
    knex("members").insert(data.members),
    knex("comments"),
    knex("comments").insert(data.comments)
  );
};
