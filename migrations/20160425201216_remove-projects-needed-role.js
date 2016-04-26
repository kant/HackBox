/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("needed_role");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.string("needed_role");
    });
};
