import config from "../config";

export const register = function (server, options, next) {
  server.ext("onRequest", (request, reply) => {
    if (config.https && request.headers["x-forwarded-proto"] === "http") {
      return reply()
        .redirect(`https://${request.headers.host}${request.url.path}`)
        .code(301);
    }
    reply.continue();
  });
  next();
};

register.attributes = {
  name: "force-https",
  version: "1.0.0"
};

export default { register };
