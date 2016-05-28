/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("project_tags", (t) => {
      t.integer("project_id").unsigned().notNull().unique().references("projects.id");
      t.text("json_tags");
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("tags");
};
