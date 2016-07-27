/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("votes", (t) => {
      t.string("oid").notNull();
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.integer("vote_category").notNull().unsigned();
      t.primary(["oid", "hackathon_id", "project_id", "vote_category"])
    })
    .table("projects", (t) => {
      t.integer("vote_count_0").notNull().unsigned().defaultTo(0);
      t.integer("vote_count_1").notNull().unsigned().defaultTo(0);
      t.integer("vote_count_2").notNull().unsigned().defaultTo(0);
      t.integer("vote_count_3").notNull().unsigned().defaultTo(0);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("votes")
    .table("projects", (t) => {
      t.dropColumnIfExists("vote_count_0");
      t.dropColumnIfExists("vote_count_1");
      t.dropColumnIfExists("vote_count_2");
      t.dropColumnIfExists("vote_count_3");
    });
};
