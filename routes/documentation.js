/*eslint camelcase: [2, {"properties": "never"}] */
const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/documentation",
    config: {
      auth: false,
      handler(request, reply) {
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
