/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.text("json_needed_roles");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("json_needed_roles");
    });
};
