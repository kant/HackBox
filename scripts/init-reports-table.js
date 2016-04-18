/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel/register");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const Promise = require("bluebird");

const sourceFile = "data/reporting.csv";
let rowsInserted = 0;

const insertRow = (email, row) => {
  return client.insert({
    email,
    json_reporting_data: JSON.stringify(row)
  })
  .into("reports")
  .then((returned) => {
    rowsInserted += 1;
    return returned;
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
        step: (row) => { // TODO be a chunk instead?
          if (row.data[0].Email) {
            const email = row.data[0].Email;
            delete row.data[0].Email;
            inserts.push(insertRow(email, row.data[0]));
          }
          return;
        },
        complete: () => {
          Promise.all(inserts)
          .then(() => {
            console.log(`Inserted ${rowsInserted} rows.`);
            process.exit();
          });
        }
      });
  });
});
