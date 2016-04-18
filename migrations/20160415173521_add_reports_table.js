/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("reports", (t) => {
      t.string("email").primary();
      t.text("json_reporting_data");
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("reports");
};
