/*eslint max-statements: [0,0]*/
// we've turned off max statements rule for this file
import db from "../db-connection";

Promise.all([
  db.schema.dropTableIfExists("participants"),
  db.schema.dropTableIfExists("comments"),
  db.schema.dropTableIfExists("members"),
  db.schema.dropTableIfExists("projects"),
  db.schema.dropTableIfExists("hackathons"),
  db.schema.dropTableIfExists("users")
]).then(() => {
  return Promise.all([
    db.schema.createTable("users", (t) => {
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
    }),
    db.schema.createTable("hackathons", (t) => {
      t.increments("id").primary();
      t.string("name");
      t.string("slug");
      t.text("description");
      t.string("logo_url");
      t.dateTime("start_date");
      t.dateTime("end_date");
    }),
    db.schema.createTable("projects", (t) => {
      t.increments("id").primary();
      t.integer("owner_id").references("id").inTable("users");
      t.string("title");
      t.string("tagline");
      t.string("status");
      t.text("description");
      t.string("image_url");
      t.string("code_respository_url");
      t.string("prototype_url");
      t.string("supporting_files");
      t.text("inspiration");
      t.text("how_it_will_work");
      t.boolean("needs_hackers").defaultTo(false);
    }),
    db.schema.createTable("comments", (t) => {
      t.increments("id").primary();
      t.integer("user_id").references("id").inTable("users");
      t.text("text");
      t.dateTime("created_date");
    }),
    db.schema.createTable("participants", (t) => {
      t.integer("user_id").references("id").inTable("users");
      t.integer("hackathon_id").references("id").inTable("hackathons");
      t.dateTime("joined_date").defaultTo(new Date());
    }),
    db.schema.createTable("members", (t) => {
      t.integer("user_id").references("id").inTable("users");
      t.integer("project_id").references("id").inTable("hackathons");
      t.dateTime("joined_date").defaultTo(new Date());
    })
  ]);
}).then(() => {
  process.stdout.write("tables re-created");
}).catch((err) => {
  if (err) {
    throw err;
  }
});


