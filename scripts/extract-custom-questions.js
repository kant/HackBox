"use strict";
require("babel-register");
const _ = require("lodash");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");

// Run the program as 'node scripts/extract-customquestions.js hacknumber'
 const query = client("participants")
    .select('users.name as name', 'participants.json_participation_meta')
    .join('users', 'users.id', 'participants.user_id')
    .where("hackathon_id", process.argv[2])
    .orderBy('joined_at');

const results = query.then((data) => {
    // Create empty array for all user responses
    const parsedAll = [];

    // First example was to extract shirt sizes. This can be changed. Not super great... - Anthony
    const shirtSizes = [];

    // Data comes as an array of objects
    data.forEach((person) => {

        // Parse the json meta and get the customQuestions value
        const getCustoms = JSON.parse(person.json_participation_meta).customQuestions;
        console.log(person.name);

        // Push CQ value into parsedAll
        parsedAll.push(getCustoms);
    });

    console.log('********');

    parsedAll.forEach((questions) => {

        if (questions === undefined) {
            return console.log('No Questions Existed');
        }
        if (questions[0].selection === undefined) {
            return console.log('Did not choose');
        }
        console.log(questions[0].selection[0]);
        // shirtSizes.push(questions[0].selection[0]);
        // console.log('****************');
    });

  process.exit();
})
.catch((err) => {
  console.log('There was an error :/ ', err);
  process.exit();
});
