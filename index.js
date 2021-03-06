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
import GlobalSearchRoutes from "./routes/global-search";
import MemberRoutes from "./routes/members";
import DataSetRoutes from "./routes/data-sets";
import CommentRoutes from "./routes/comments";
import StatsRoutes from "./routes/shares-likes-views";
import DocumentationRoutes from "./routes/documentation";
import AwardsRoutes from "./routes/awards";
import AwardCategoriesRoutes from "./routes/award-categories";
import ReportRoutes from "./routes/reports";
import HackbotRoutes from "./routes/hackbot";
import WhitelistRoutes from "./routes/whitelist";
import AclRoutes from "./routes/acl";
import CheckinsRoutes from "./routes/checkins";
import OneWeekRoutes from "./routes/oneweek";
import ChallengeRoutes from "./routes/challenges";
import config from "./config";
import AuthPlugin from "./plugins/auth";
import HapiSwagger from "hapi-swagger";
import Jade from "jade";
let appInsights = require("applicationinsights");
appInsights.setup().start(); // assuming ikey in env var. start() can be omitted to disable any non-custom data
let client = appInsights.defaultClient;
//This line starts sending azure application insight info about node server stats
//App should has env veriable with instrumentation key of app insights service
appInsights.setup().start();

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
            credentials: true,
            headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'x-ms-request-id', 'x-ms-request-root-id']
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
      enableDocumentationPage: false,
      apiVersion: "1.0"
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
  GlobalSearchRoutes,
  ParticipantRoutes,
  ProjectRoutes,
  UserRoutes,
  MemberRoutes,
  CommentRoutes,
  DataSetRoutes,
  StatsRoutes,
  DocumentationRoutes,
  AwardsRoutes,
  AwardCategoriesRoutes,
  ReportRoutes,
  HackbotRoutes,
  WhitelistRoutes,
  AclRoutes,
  CheckinsRoutes,
  OneWeekRoutes,
  ChallengeRoutes,
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
    server.log(["info", "start"], `api server started at ${server.info.uri}\n`);
});

module.exports = server;

