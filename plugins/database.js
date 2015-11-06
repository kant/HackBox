// closes DB connections when server is stopped
import db from "../db-connection";

const register = function (server, options, next) {
  server.ext("onPostStop", () => {
    db.destroy();
  });

  next();
};

register.attributes = {
  name: "db-connection",
  version: "1.0.0"
};

export default { register };
