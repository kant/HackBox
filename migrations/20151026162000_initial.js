/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.string("username");
      t.string("email");
      t.text("bio");
      t.string("job_title");
      t.string("company_name");
      t.dateTime("registration_date");
      t.string("photo_url");
      t.string("address_1");
      t.string("address_2");
      t.string("city");
      t.string("state");
      t.string("country");
      t.string("twitter");
      t.string("facebook");
      t.string("linkedin");
    })
    .createTable("hackathons", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.string("slug");
      t.text("description");
      t.string("logo_url");
      t.dateTime("start_date");
      t.dateTime("end_date");
    })
    .createTable("projects", (t) => {
      t.increments("id").primary();
      t.integer("owner_id").references("id").inTable("users");
      t.string("title");
      t.string("tagline");
      t.string("status");
      t.text("description");
      t.string("image_url");
      t.string("code_repo_url");
      t.string("prototype_url");
      t.string("supporting_files_url");
      t.text("inspiration");
      t.text("how_it_will_work");
      t.boolean("needs_hackers").defaultTo(false);
      t.string("tags");
      // we'll wait to see how this is supposed to work
      // t.integer("venue_id").references("id").inTable("venues");
      t.integer("venue_id");
      t.integer("video_id");
    })
    .createTable("comments", (t) => {
      t.increments("id").primary();
      t.integer("user_id").references("id").inTable("users");
      t.integer("project_id").references("id").inTable("projects");
      t.text("text");
      t.dateTime("created_date");
    })
    .createTable("participants", (t) => {
      t.integer("user_id").references("id").inTable("users");
      t.integer("hackathon_id").references("id").inTable("hackathons");
      t.dateTime("joined_date").defaultTo(new Date());
    })
    .createTable("members", (t) => {
      t.integer("user_id").references("id").inTable("users");
      t.integer("project_id").references("id").inTable("projects");
      t.dateTime("joined_date").defaultTo(new Date());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("participants")
    .dropTableIfExists("comments")
    .dropTableIfExists("members")
    .dropTableIfExists("projects")
    .dropTableIfExists("hackathons")
    .dropTableIfExists("users");
};
