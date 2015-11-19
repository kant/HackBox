require("babel/register");
require("./comments");
require("./hackathons");
require("./members");
require("./participants");
require("./projects");
require("./project-search");
require("./users");
// require("./auth");

// run this last to shut down the server
// and the DB connection so it ends cleanly
require("./wrap-up");
