import fixedData from "../data/fixed-data";
import { paramCase, sentenceCase } from "change-case";

const register = function (server, options, next) {
  server.route({
    method: "GET",
    path: "/data-sets",
    config: {
      description: "Convenience method for fetching all data sets",
      notes: "For rendering filter search pages. try it: <a href=\"/data-sets\">/data-sets</a>",
      tags: ["convenience", "unsecured"],
      handler(request, reply) {
        reply(fixedData);
      }
    }
  });

  // create one per type
  for (const item in fixedData) { // eslint-disable-line guard-for-in
    const url = `/data-sets/${paramCase(item)}`;

    server.route({
      method: "GET",
      path: url,
      config: {
        description: `Fetch all ${sentenceCase(item)}.`,
        notes: `try it: <a href="${url}">${url}</a>`,
        tags: ["convenience", "unsecured"],
        handler(request, reply) { // eslint-disable-line no-loop-func
          reply(fixedData[item]);
        }
      }
    });
  }

  next();
};

register.attributes = {
  name: "data-sets",
  version: "1.0.0"
};

export default { register };
