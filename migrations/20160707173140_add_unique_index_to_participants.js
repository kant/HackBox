/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("participants", (t) => {
      t.unique(["user_id", "hackathon_id"]);
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("participants", (t) => {
      t.dropUnique(["user_id", "hackathon_id"]);
    });
};
