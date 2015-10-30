/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (t) => {
      t.increments("id").primary();
      t.string("display_name");
      t.string("email");
      t.text("bio");
      t.timestamps();
      t.boolean("super_user").defaultTo(false);
      t.text("json_profile");
      t.text("json_meta");
    })
    .createTable("hackathons", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.string("slug");
      t.text("description");
      t.string("logo_url");
      t.dateTime("start_at");
      t.dateTime("end_at");
      t.string("contact_name");
      t.string("contact_email");
      t.timestamps();
      t.text("json_meta");
    })
    .createTable("projects", (t) => {
      t.increments("id").primary();
      t.integer("owner_id").unsigned().references("users.id");
      t.integer("hackathon_id").unsigned().references("hackathon.id");
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
      t.integer("video_id");
      t.timestamps();
      t.text("json_meta");
    })
    .createTable("comments", (t) => {
      t.increments("id").primary();
      t.integer("user_id").unsigned().references("users.id");
      t.integer("project_id").unsigned().references("projects.id");
      t.text("text");
      t.dateTime("created_at");
    })
    .createTable("participants", (t) => {
      t.integer("user_id").unsigned().references("users.id");
      t.integer("hackathon_id").unsigned().references("hackathons.id");
      t.dateTime("joined_at");
    })
    .createTable("members", (t) => {
      t.integer("user_id").unsigned().references("users.id");
      t.integer("project_id").unsigned().references("projects.id");
      t.dateTime("joined_at");
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