/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.string("profession");
      t.string("discipline");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.dropColumn("discipline");
      t.dropColumn("profession");
    });
};
