/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel-register");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const Promise = require("bluebird");

const sourceFile = "data/feedstore-032217-small.csv";
let rowsInserted = 0;
let rowsSkipped = 0;

const insertRow = (email, row) => {
  return client.insert({
    email,
    json_reporting_data: JSON.stringify(row)
  })
  .into("reports")
  .then((returned) => {
    rowsInserted += 1;
    return returned;
  })
  .catch((e) => {
    console.log(`Rejected: ${email}. Reason: ${e}`);
    return;
  });
};

fs.readFile(sourceFile, (err, csv) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  const inserts = [];

  client("reports").del()
  .then(() => {
    baby.parse(String(csv),
      {
        header: true,
        skipEmptyLines: true,
        step: (row) => { // Could `chunk` function for possible perfomance gain/++code complexity
          if (row.data[0].Email) {
            const email = row.data[0].Email;
            if (email === "n/a@microsoft.com") {
              rowsSkipped += 1;
              return;
            }
            delete row.data[0].Email;
            inserts.push(insertRow(email, row.data[0]));
            console.log(inserts.length);
          }
          return;
        },
        complete: () => {
          Promise.all(inserts)
          .then(() => {
            console.log(`Inserted ${rowsInserted} rows.`);
            console.log(`Skipped ${rowsSkipped} rows with email "n/a@microsoft.com"`);
            process.exit();
          });
        }
      });
  });
});
