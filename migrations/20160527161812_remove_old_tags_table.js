/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .dropTableIfExists("tags");
};

exports.down = (knex) => {
  return knex.schema
    .createTable("tags", (t) => {
      t.increments("id").primary();
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.string("tag").notNull();
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
};
