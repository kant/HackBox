/*eslint max-statements: [0,0], filenames/filenames: [2, "^.*$"]*/

exports.up = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.text("json_windows_focus");
      t.text("json_devices_focus");
      t.text("json_dynamics_focus");
      t.text("json_third_party_platforms_focus");
      t.text("json_cloud_enterprise_focus");
      t.text("json_consumer_services_focus");
      t.text("json_office_focus");
      t.text("json_misc_focus");
      t.text("json_other_focus");
    });
};

exports.down = (knex) => {
  return knex.schema
    .table("projects", (t) => {
      t.dropColumn("json_windows_focus");
      t.dropColumn("json_devices_focus");
      t.dropColumn("json_dynamics_focus");
      t.dropColumn("json_third_party_platforms_focus");
      t.dropColumn("json_cloud_enterprise_focus");
      t.dropColumn("json_consumer_services_focus");
      t.dropColumn("json_office_focus");
      t.dropColumn("json_misc_focus");
      t.dropColumn("json_other_focus");
    });
};
