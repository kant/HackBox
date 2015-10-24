/*eslint no-console: 1*/
import db from "../db-connection";
import { users, hackathons, projects } from "../data/mock-data";

db("users").insert(users).then(() => {
  return db("hackathons").insert(hackathons);
}).then(() => {
  return db("projects").insert(projects);
}).then(() => {
  process.stdout.write("done");
}).catch((err) => {
  throw err;
});
