/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.text("json_interests");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("users", (t) => {
      t.dropColumn("json_interests");
    });
};
