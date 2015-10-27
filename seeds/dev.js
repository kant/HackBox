require("babel/register");
var data = require("../data/mock-data");

exports.seed = function (knex, Promise) {
  return Promise.join(
    knex("users").del().insert(data.users),
    knex("hackathons").del().insert(data.hackathons),
    knex("projects").del().insert(data.projects),
    knex("participants").del().insert(data.participants),
    knex("members").del().insert(data.members),
    knex("comments").del().insert(data.comments)
  );
};
