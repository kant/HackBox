
exports.up = function(knex) => {
    return knex.schema
    .table("projects", (t) => {
      t.integer("like_count").unsigned().defaultTo(0);
      t.integer("view_count").unsigned().defaultTo(0);
      t.integer("comment_count").unsigned().defaultTo(0);
      t.integer("share_count").unsigned().defaultTo(0);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
  .table("projects", (t) => {
    t.dropColumn("like_count");
    t.dropColumn("view_count");
    t.dropColumn("comment_count");
    t.dropColumn("share_count");
  });
};
