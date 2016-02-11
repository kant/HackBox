/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.boolean("writing_code").defaultTo(false);
      t.boolean("existing").defaultTo(false);
      t.boolean("external_customers").defaultTo(false);
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("external_customers");
      t.dropColumn("existing");
      t.dropColumn("writing_code");
    });
};
