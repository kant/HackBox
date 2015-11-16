import Hapi from "hapi";
import Good from "good";
import GoodConsole from "good-console";
import Vision from "vision";
import Inert from "inert";
import Bell from "bell";
import PaginationPlugin from "./plugins/paginate";
import ExpandMetaPlugin from "./plugins/expand-meta";
import DbPlugin from "./plugins/database";
import HackathonRoutes from "./routes/hackathons";
import ProjectRoutes from "./routes/projects";
import ParticipantRoutes from "./routes/participants";
import UserRoutes from "./routes/users";
import MemberRoutes from "./routes/members";
import DataSetRoutes from "./routes/data-sets";
import CommentRoutes from "./routes/comments";
import StatsRoutes from "./routes/shares-likes-views";
import config from "./config";
import AuthPlugin from "./plugins/auth";
import HapiSwagger from "hapi-swagger";

const server = new Hapi.Server();
const port = process.env.PORT || 3000;
const authEnabled = process.env.AUTH_ENABLED || false;

const getAuthConfig = function (isEnabled) {
  if (isEnabled) {
    return { strategy: "bearer" };
  }
  return false;
};

server.connection({
  host: "0.0.0.0",
  routes: {
    cors: {
      credentials: true
    },
    validate: {
      options: {
        stripUnknown: true
      }
    },
    auth: getAuthConfig(authEnabled)
  },
  port
});

server.register([
  AuthPlugin,
  Inert,
  Vision,
  HapiSwagger,
  Bell,
  {
    register: Good,
    options: {
      reporters: [{
        reporter: GoodConsole,
        events: config.logEvents
      }]
    }
  },
  DbPlugin,
  HackathonRoutes,
  ParticipantRoutes,
  ProjectRoutes,
  UserRoutes,
  MemberRoutes,
  CommentRoutes,
  DataSetRoutes,
  StatsRoutes,
  PaginationPlugin,
  ExpandMetaPlugin
], (err) => {
  if (err) {
    throw err;
  }
});

server.start(() => {
  process.stdout.write(`api server started at ${server.info.uri}\n`);
});

module.exports = server;
