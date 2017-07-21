/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel/register");
const _ = require("lodash");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");

let msft = [];

client("reports").then((reports) => {
  
  reports.forEach((element) => {
    if (element.email.indexOf('@microsoft.com') == -1) {
      console.log('================+>>>>>>>>>>>>>');
    }
    let data = JSON.parse(element.json_reporting_data);
    msft.push([element.email.substring(0, element.email.length - 14).toLowerCase(), data.DisplayName]);
  });

  client("users").then((users) => {
      users.forEach((user) => {
        if (user.alias.startsWith('v-')) {
          msft.push([user.alias.substring(0, user.email.length - 14).toLowerCase(), user.name, user.id]);
        }
      });
      fs.writeFile('myjsonfile.json', JSON.stringify(msft), 'utf8', (err, result) => {
      console.log(err);
      console.log(result);
  });
  });
  
  
});



