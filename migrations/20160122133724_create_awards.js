/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("awards", (t) => {
      t.increments("id").primary();
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.string("name");
      t.text("json_meta");
    })
    .createTable("award_categories", (t) => {
      t.increments("id").primary();
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
      t.integer("parent_id").unsigned();
      t.string("name");
    })
    .createTable("awards_award_categories", (t) => {
      t.integer("award_id").notNull().unsigned().references("awards.id");
      t.integer("award_category_id").notNull().unsigned().references("award_categories.id");
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("awards_award_categories")
    .dropTableIfExists("awards")
    .dropTableIfExists("award_categories");
};
