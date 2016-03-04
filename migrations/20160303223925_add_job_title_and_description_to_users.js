/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.string("job_title");
      t.string("department");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.dropColumn("job_title");
      t.dropColumn("department");
    });
};
