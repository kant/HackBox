/*eslint no-console: 1, no-process-exit: 0*/
import db from "../db-connection";
import { users, hackathons, projects, members, comments, participants } from "../data/mock-data";

db("users").insert(users).then(() => {
  return db("hackathons").insert(hackathons);
}).then(() => {
  return db("projects").insert(projects);
}).then(() => {
  return db("users").insert(users);
}).then(() => {
  return db("participants").insert(participants);
}).then(() => {
  return db("members").insert(members);
}).then(() => {
  return db("comments").insert(comments);
}).then(() => {
  process.stdout.write("done");
  process.exit(0);
}).catch((err) => {
  throw err;
});
