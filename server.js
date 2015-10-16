import Hapi from "hapi";
import Good from "good";
import GoodConsole from "good-console";
import Vision from "vision";
import Inert from "inert";
import Lout from "lout";
import * as PaginationPlugin from "./plugins/paginate";
import * as HackathonRoutes from "./routes/hackathons";

const server = new Hapi.Server({ debug: { request: ["error"] } });
const port = process.env.PORT || 3000;

server.connection({
  host: "0.0.0.0",
  port: port,
  routes: {
    cors: {
      credentials: true,
    },
  },
});

server.register([
  Inert,
  Vision,
  Lout,
  {
    register: Good,
    options: {
      reporters: [{
        reporter: GoodConsole,
        events: { log: "*", response: "*" },
      }],
    },
  },
  HackathonRoutes,
  PaginationPlugin,
], function(err) {
  if (err) {
    console.error(err);
  }
});

server.start(function() {
  console.info("api server started at " + server.info.uri);
});

module.exports = server;
