import Hapi from "hapi";
import Good from "good";
import GoodConsole from "good-console";
import GoodFile from "good-file";
import Vision from "vision";
import Inert from "inert";
import Bell from "bell";
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

let serverOpts = {};
if (config.serverDebug) {
  serverOpts = { debug: { request: ["error"] } };
}

const server = new Hapi.Server(serverOpts);
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
  {
    register: HapiSwagger,
    options: {
      protocol: config.https ? "https" : "http"
    }
  },
  Bell,
  {
    register: Good,
    options: {
      reporters: [
        {
          reporter: GoodConsole,
          events: config.logEvents
        },
        {
          reporter: GoodFile,
          events: { error: "*" },
          config: "./error.log"
        }
      ]
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
