/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("cities", (t) => {
      t.increments("id").primary();
      t.string("city").notNull();
      t.string("country");
      t.decimal("lat", 13, 10).notNull(); // 13 total digits, 10 after decimal
      t.decimal("long", 13, 10).notNull();
    })
    .createTable("city_counts", (t) => {
      t.integer("city_id").notNull().unsigned().references("cities.id");
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
      t.integer("count").notNull().unsigned().defaultTo(0);
      t.index("hackathon_id");
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("city_counts")
    .dropTableIfExists("cities");
};
