/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";
require("babel/register");
const _ = require("lodash");
const baby = require("babyparse");
const client = require("../db-connection").default;
const fs = require("fs");
const knex = require("knex");

/*
* USAGE:
* 1. Backup users table:
* mysqldump -h us-cdbr-azure-west-c.cloudapp.net -u bf57695f34b565 -p hackboxdb users > users.sql
* 2. Ensure CSV column names match db column names.
* 3. Update sourceFile and, if needed, nullValue
* 4. Test locally, then NODE_ENV=production npm run update-users
*/
const sourceFile = "data/hackboxusers_participants_update-6-8.csv";
const nullValue = "NULL";

let rowsUpdated = 0;
const usersSkipped = [];

const updateRow = (user) => {
  const userId = user.id;
  delete user.id;
  const email = user.email;
  user.email = knex.raw(`coalesce (email, "${email}")`); // Update email only if null

  user = _.pick(user, (value) => {
    return value !== nullValue;
  });

  if (!Object.keys(user).length) {
    usersSkipped.push(userId);
    return false;
  }

  const query = client("users")
    .update(user)
    .where("id", userId);

    return query.then((returned) => {
    rowsUpdated += 1;
    return returned;
  })
    .catch((e) => {
      console.log(`Failed to update ${userId}. Reason: ${e}`);
      return;
    });
};


fs.readFile(sourceFile, (err, csv) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  const inserts = [];

  baby.parse(String(csv),
    {
      header: true,
      skipEmptyLines: true,
      step: (row) => {
        inserts.push(updateRow(row.data[0]));
        return;
      },
      complete: () => {
        Promise.all(inserts)
        .then(() => {
          console.log(`Updated ${rowsUpdated} rows.`);
          const numSkipped = usersSkipped.length;
          console.log(`Skipped ${numSkipped} users with no updated data.`);
          process.exit();
        });
      }
    });
});
