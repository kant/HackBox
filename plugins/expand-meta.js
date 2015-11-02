// We want to be able to allow some flexibility in the API
// by allowing the client application to store additional
// meta-data along with some of the objects, such as
// gathering T-Shirt size for participants of a hackathon, for example.
//
// This is done by having a `json_meta` field in some of the database
// tables that store a JSON string.

// To avoid constantly having to worry about whether to encode/decode
// these keys and to avoid passing that concern to the clients this
// plugin handlers that centrally.
//
// It works as follows:
//
// 1. Any incoming payload item named `meta` or `profile`
//    will be validated by normal route validation rules but
//    stringified and renamed to be `json_meta` and `json_profile`
//    respectively, before being passed to the route handler.
// 2. Any outgoing response that contains keys that start
//    with `json_*` will be renamed stripped of that prefix
//    and returned as parsed JSON.
const expandResult = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(expandResult);
  } else {
    for (const key in obj) {
      const split = key.split("json_");
      const value = obj[key];
      if (split.length === 2) {
        obj[split[1]] = JSON.parse(value);
        delete obj[key];
      }
      if (typeof value === "object") {
        expandResult(value);
      }
    }
  }
  return obj;
};

const stringifyKeys = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(stringifyKeys);
  } else {
    for (const key in obj) {
      if (key === "meta" || key === "profile") {
        obj[`json_${key}`] = JSON.stringify(obj[key]);
        delete obj[key];
      }
    }
  }
  return obj;
};

const register = function (server, options, next) {
  server.ext("onPreResponse", (request, reply) => {
    expandResult(request.response.source);
    return reply.continue();
  });

  server.ext("onPreHandler", (request, reply) => {
    stringifyKeys(request.payload);
    return reply.continue();
  });

  next();
};

register.attributes = {
  name: "expand-meta",
  version: "1.0.0"
};

export default { register };
