/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .createTable("logins", (t) => {
      t.string("token_hash").primary();
      t.text("credentials").notNull();
      t.bigInteger("expires").notNull().unsigned();
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("logins");
};
