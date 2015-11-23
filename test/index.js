require("babel/register");

require("./hackathons");
require("./comments");
require("./members");
require("./participants");
require("./project-search");
require("./users");
require("./projects");
// require("./auth");

// run this last to shut down the server
// and the DB connection so it ends cleanly
require("./wrap-up");
