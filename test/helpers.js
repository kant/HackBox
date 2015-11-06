/*eslint no-console:0, max-statements: [0,0]*/
// This is a helper for writing tests with some
// logical defaults and simplified checks for looking
// for things like pagination, etc.
import server from "../index";
import Joi from "joi";
import { pagination as paginationSchema } from "../data/validation";

export default (opts, t) => {
  const defaults = {
    method: "GET",
    statusCode: 200,
    allowUnknown: true,
    bodyEmpty: false
  };

  // fill in defaults
  for (const item in defaults) {
    if (!opts.hasOwnProperty(item)) {
      opts[item] = defaults[item];
    }
  }

  if (opts.statusCode === 204) {
    opts.bodyEmpty = true;
  }

  const injectConfig = {
    method: opts.method,
    url: opts.url
  };

  if (opts.payload) {
    injectConfig.payload = opts.payload;
  }

  server.inject(injectConfig, (response) => {
    let parsed;

    t.doesNotThrow(() => {
      const { payload } = response;
      if (payload) {
        parsed = JSON.parse(payload);
      } else if (!opts.bodyEmpty) {
        throw new Error("paylod body should not be empty");
      }
    }, "gets a JSON parseable payload");

    if (opts.hasPagination) {
      const result = Joi.validate(parsed, paginationSchema, {allowUnknown: true});
      t.ok(!result.err, "has pagination");
    } else if (parsed) {
      t.ok(!parsed.hasOwnProperty("limit"), "should not have property: \"limit\"");
      t.ok(!parsed.hasOwnProperty("offset"), "should not have property: \"offset\"");
    }

    if (opts.schema) {
      const result = Joi.validate(parsed, paginationSchema, {allowUnknown: opts.allowUnknown});
      t.ok(!result.err, `matches schema, response:\n${JSON.stringify(parsed, null, 2)}`);
    }

    t.equal(response.statusCode, opts.statusCode, `status code is ${opts.statusCode}`);

    if (opts.test) {
      opts.test(parsed);
    }

    t.end();
  });
};
