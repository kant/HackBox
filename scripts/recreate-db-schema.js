import db from "../db-connection";

Promise.all([
  db.schema.dropTableIfExists("users")
]).then(() => {
  return Promise.all([
    db.schema.createTable("users", (t) => {
      t.increments("id").primary();
      t.string("name", 100);
    })
  ]);
}).then(() => {
  process.stdout.write("tables re-created");
}).catch((err) => {
  if (err) {
    throw err;
  }
});
