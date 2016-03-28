/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.text("json_executive_challenges");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("json_executive_challenges");
    });
};

