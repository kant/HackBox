require("babel/register");
var data = require("../data/mock-data");

exports.seed = function (knex, Promise) {
  return knex("users").del().insert(data.users).then(() => {
    return knex("hackathons").del().insert(data.hackathons);
  }).then(() => {
    return knex("projects").del().insert(data.projects);
  }).then(() => {
    return knex("participants").del().insert(data.participants);
  }).then(() => {
    return knex("members").del().insert(data.members);
  }).then(() => {
    return knex("comments").del().insert(data.comments);
  });
};
