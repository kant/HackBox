/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.string("city");
      t.string("alias");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.dropColumn("alias");
      t.dropColumn("city");
    });
};
