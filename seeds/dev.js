require("babel-register");
var data = require("../data/mock-data");

exports.seed = function (knex, Promise) {
  return knex("users").del().insert(data.users)
    .then(() => {
      return knex("hackathons").del().insert(data.hackathons);
    }).then(() => {
      return knex("hackathon_admins").del().insert(data.hackathonAdmins);
    }).then(() => {
      return knex("projects").del().insert(data.projects);
    }).then(() => {
      return knex("participants").del().insert(data.participants);
    }).then(() => {
      return knex("members").del().insert(data.members);
    }).then(() => {
      return knex("comments").del().insert(data.comments);
    }).then(() => {
      return knex("award_categories").del().insert(data.awardCategories);
    });
};
