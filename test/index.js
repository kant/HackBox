require("babel-register");
require("babel-preset-env");

require("./hackathons");
require("./comments");
require("./members");
require("./participants");
require("./projects");
require("./project-search");
require("./users");
require("./user-search");
require("./hackathon-search");
require("./awards");
require("./award-categories");
require("./validationTests");
// Running this requires a valid auth token <1hr old saved as TOKEN at project route
// require("./auth");

// run this last to shut down the server
// and the DB connection so it ends cleanly
require("./wrap-up");
