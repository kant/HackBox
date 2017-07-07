//The country-mapping script is used to identify users 

"use strict";
require("babel/register");
const _ = require("lodash");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");
const countries = require("../countryMap");

// Run the program as 'node scripts/extract-customquestions.js hacknumber'
 const query = client("users")
    .select('users.id', 'users.email', 'users.city', 'users.country')
    // .count('*')j
    .join('participants', 'participants.user_id', 'users.id')
    .where("hackathon_id", 1074)
    .where("country", "N/A")
    .orderBy('updated_at');

const results = query.then((data) => {

    let queryPush = [];

    data.forEach(function(data) {
        if (data.city !== 'N/A') {
            if (countries[data.city]) {
                    const countryUser = countries[data.city].country;
                    const query2 = client("users").update({country: countryUser}).where({id: data.id});
                    queryPush.push(query2);
            }
            console.log(data.city);
        }
    });

    Promise.all(queryPush).then((values) => {
        console.log('Complete');
        process.exit();
    });

})
.catch((err) => {
  console.log('There was an error :/ ', err);
  process.exit();
});