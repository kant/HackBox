let appInsights = require("applicationinsights");
appInsights.setup().start(); // assuming ikey in env var. start() can be omitted to disable any non-custom data
let client = appInsights.defaultClient;

/*eslint camelcase: [2, {"properties": "never"}] */
const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/documentation",
    config: {
      auth: false,
      handler(request, reply) {
        client.trackEvent("Documentation", {});
        reply.view("documentation");
      }
    }
  });

  next();
};


register.attributes = {
  name: "swagger-documentation",
  version: "1.0.0"
};

export default { register };
