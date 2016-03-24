require("babel/register");
const db = require("../config").db;
const client = require("../db-connection").default;
var Promise = require("bluebird");

const initCountsForProject = (projectId) => {
 return client.raw(`update projects
  set
   like_count = (
     select count(*) from likes
     where project_id = ${projectId}
   ),
   share_count = (
     select count(*) from shares
     where project_id = ${projectId}
   ),
   comment_count = (
     select count(*) from comments
     where project_id = ${projectId}
   ),
   view_count = (
     select count(*) from views
     where project_id = ${projectId}
   )
  where id = ${projectId};`);
};

const initSocialCounts = () => {
  const updates = []

  client
  .select("id")
  .from("projects")
  .then((projects) => {
    console.log("got " + projects.length + " projects");
    for (project in projects) {
      updates.push(initCountsForProject(project));
    }
    Promise.all(updates).then(() => {
      process.exit();
    });
  });
};

initSocialCounts();
