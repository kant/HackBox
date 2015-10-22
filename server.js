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
import MemberRoutes from "./routes/members";
import DataSetRoutes from "./routes/data-sets";
import CommentRoutes from "./routes/comments";

const server = new Hapi.Server({ debug: { request: ["error"] } });
const port = process.env.PORT || 3000;

server.connection({
  host: "0.0.0.0",
  routes: {
    cors: {
      credentials: true
    }
  },
  port
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
        events: { log: "*", response: "*" }
      }]
    }
  },
  HackathonRoutes,
  ParticipantRoutes,
  ProjectRoutes,
  UserRoutes,
  MemberRoutes,
  CommentRoutes,
  DataSetRoutes,
  PaginationPlugin
], (err) => {
  if (err) {
    throw err;
  }
});

server.start(() => {
  process.stdout.write(`api server started at ${server.info.uri}\n`);
});

module.exports = server;
