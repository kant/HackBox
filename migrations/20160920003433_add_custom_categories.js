/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("hackathons", (t) => {
      t.text("json_custom_categories");
    })
    .table("projects", (t) => {
      t.text("json_custom_categories");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("hackathons", (t) => {
      t.dropColumn("json_custom_categories");
    })
    .table("projects", (t) => {
      t.dropColumn("json_custom_categories");
    });
};
