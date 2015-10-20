import Hapi from "hapi";
import Good from "good";
import GoodConsole from "good-console";
import Vision from "vision";
import Inert from "inert";
import Lout from "lout";
import PaginationPlugin from "./plugins/paginate";
import HackathonRoutes from "./routes/hackathons";
import ProjectRoutes from "./routes/projects";
import ParticipantRoutes from "./routes/participants";
import UserRoutes from "./routes/users";
import DataSetRoutes from "./routes/data-sets";
import CommentRoutes from "./routes/comments";

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
  ParticipantRoutes,
  ProjectRoutes,
  UserRoutes,
  CommentRoutes,
  DataSetRoutes,
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
