import Hapi from "hapi";
import Good from "good";
import GoodConsole from "good-console";
import Vision from "vision";
import Inert from "inert";
import Bell from "bell";
import ExpandMetaPlugin from "./plugins/expand-meta";
import DbPlugin from "./plugins/database";
import HackathonRoutes from "./routes/hackathons";
import ProjectRoutes from "./routes/projects";
import ParticipantRoutes from "./routes/participants";
import UserRoutes from "./routes/users";
import GlobalStatsRoutes from "./routes/global-stats";
import MemberRoutes from "./routes/members";
import DataSetRoutes from "./routes/data-sets";
import CommentRoutes from "./routes/comments";
import StatsRoutes from "./routes/shares-likes-views";
import DocumentationRoutes from "./routes/documentation";
import config from "./config";
import AuthPlugin from "./plugins/auth";
import HapiSwagger from "hapi-swagger";
import Jade from "jade";

let serverOpts = {};
if (config.serverDebug) {
  serverOpts = { debug: { request: ["error"] } };
}

const server = new Hapi.Server(serverOpts);
const port = process.env.PORT || 3000;

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
    auth: {
      strategy: "bearer"
    }
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
      protocol: config.https ? "https" : "http",
      enableDocumentationPage: false
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
        }
      ]
    }
  },
  DbPlugin,
  HackathonRoutes,
  GlobalStatsRoutes,
  ParticipantRoutes,
  ProjectRoutes,
  UserRoutes,
  MemberRoutes,
  CommentRoutes,
  DataSetRoutes,
  StatsRoutes,
  DocumentationRoutes,
  ExpandMetaPlugin
], (err) => {
  if (err) {
    throw err;
  }
});

server.views({
  engines: {
    jade: Jade
  },
  path: `${__dirname}/templates`,
  compileOptions: {
    pretty: true
  }
});

server.start(() => {
  process.stdout.write(`api server started at ${server.info.uri}\n`);
});

module.exports = server;
