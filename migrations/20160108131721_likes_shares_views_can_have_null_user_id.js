/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = function (knex) {
  return knex.schema
    .raw("alter table likes modify user_id VARCHAR(255)")
    .raw("alter table views modify user_id VARCHAR(255)")
    .raw("alter table shares modify user_id VARCHAR(255)");
};

exports.down = function () {
  // can't be rolled back because once null values are present, those rows become invalid
  // return knex.schema
  //   .raw("alter table likes modify user_id VARCHAR(255) NOT NULL")
  //   .raw("alter table views modify user_id VARCHAR(255) NOT NULL")
  //   .raw("alter table shares modify user_id VARCHAR(255) NOT NULL");
};
