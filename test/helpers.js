/*eslint no-console:0, max-statements: [0,0]*/
// This is a helper for writing tests with some
// logical defaults and simplified checks for looking
// for things like pagination, etc.
import server from "../index";
import Joi from "joi";
import { paginationResults } from "../data/validation";

export default (opts, t) => {
  const defaults = {
    method: "GET",
    statusCode: 200,
    allowUnknown: true,
    bodyEmpty: false,
    hasPagination: false,
    user: "a",
    token: "" // falsy, "regular", "super" or real token
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

  // pass an appropriate test token
  // based on "user" we're simulating
  // if user is passed
  if (!opts.token && opts.user) {
    opts.token = {
      a: "super",
      b: "regular",
      c: "regular2"
    }[opts.user];
  }

  if (opts.token) {
    injectConfig.headers = {
      Authorization: `Bearer ${opts.token}`
    };
  }

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
      const result = Joi.validate(parsed, paginationResults, {allowUnknown: true});
      t.ok(!result.error, "has pagination");
    } else if (parsed) {
      t.ok(!parsed.hasOwnProperty("limit"), "should not have property: \"limit\"");
      t.ok(!parsed.hasOwnProperty("offset"), "should not have property: \"offset\"");
    }

    if (opts.schema) {
      if (opts.hasPagination) {
        parsed.data.forEach((item) => {
          const result = Joi.validate(item, opts.schema, {allowUnknown: opts.allowUnknown});
          t.ok(!result.error, "each result in data matches schema");
          if (result.error) {
            console.log(result.error);
          }
        });
      } else {
        const result = Joi.validate(parsed, opts.schema, {allowUnknown: opts.allowUnknown});
        t.ok(!result.error, "matches schema");
        if (result.error) {
          console.log(result.error);
        }
      }
    }

    t.equal(response.statusCode, opts.statusCode, `status code is ${opts.statusCode}`);

    if (opts.test) {
      opts.test(parsed);
    }

    t.end();
  });
};
