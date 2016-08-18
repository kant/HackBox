/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("video_views", (t) => {
      t.integer("project_id").unsigned().notNull().unique().references("projects.id");
      t.integer("views").unsigned().notNull();
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("video_views");
};
