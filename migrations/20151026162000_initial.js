/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = function (knex) {
  return knex.schema
    .createTable("users", (t) => {
      t.string("id").primary();
      t.string("name");
      t.string("family_name");
      t.string("given_name");
      t.string("email");
      t.text("bio");
      t.string("country");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("updated_at").nullable();
      t.boolean("deleted").defaultTo(false);
      t.string("working_on");
      t.string("expertise");
      t.string("primary_role");
      t.string("product_focus");
      t.text("json_profile");
      t.text("json_meta");
    })
    .createTable("hackathons", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.string("slug");
      t.string("tagline");
      t.text("description");
      t.text("judges");
      t.text("rules");
      t.text("schedule");
      t.text("quick_links");
      t.string("logo_url");
      t.dateTime("start_at");
      t.dateTime("end_at");
      t.string("org");
      t.string("city");
      t.string("country");
      t.string("color_scheme");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("updated_at").nullable();
      t.boolean("deleted").defaultTo(false);
      t.boolean("is_public").defaultTo(true);
      t.text("json_meta");
    })
    .createTable("projects", (t) => {
      t.increments("id").primary();
      t.string("owner_id").notNull().references("users.id");
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
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
      t.string("needed_role");
      t.string("needed_expertise");
      t.string("product_focus");
      t.string("customer_type");
      t.string("tags");
      t.integer("video_id");
      t.timestamp("created_at").defaultTo(knex.fn.now());
      t.timestamp("updated_at").nullable();
      t.boolean("deleted").defaultTo(false);
      t.text("json_meta");
    })
    .createTable("hackathon_admins", (t) => {
      t.string("user_id").notNull().references("users.id");
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
    })
    .createTable("comments", (t) => {
      t.increments("id").primary();
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.text("body");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("participants", (t) => {
      t.string("user_id").references("users.id");
      t.integer("hackathon_id").notNull().unsigned().references("hackathons.id");
      t.timestamp("joined_at").defaultTo(knex.fn.now());
      t.text("json_participation_meta");
    })
    .createTable("members", (t) => {
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.timestamp("joined_at").defaultTo(knex.fn.now());
    })
    .createTable("likes", (t) => {
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("views", (t) => {
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("shares", (t) => {
      t.string("user_id").notNull().references("users.id");
      t.integer("project_id").notNull().unsigned().references("projects.id");
      t.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("shares")
    .dropTableIfExists("views")
    .dropTableIfExists("likes")
    .dropTableIfExists("participants")
    .dropTableIfExists("comments")
    .dropTableIfExists("members")
    .dropTableIfExists("projects")
    .dropTableIfExists("hackathon_admins")
    .dropTableIfExists("hackathons")
    .dropTableIfExists("users");
};
