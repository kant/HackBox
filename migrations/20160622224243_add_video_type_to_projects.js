/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.string("video_type");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("video_type");
    });
};
