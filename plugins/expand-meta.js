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
// 3. `true` will be translated to `1`, false will be translated
//    to `0` and vice versa.
const BOOLEAN_KEYS = [
  "deleted", "blocked", "is_public", "is_published",
  "needs_hackers", "has_project", "show_name",
  "show_rules", "show_judges", "show_schedule",
  "writing_code", "existing", "external_customers"
];

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
      if (BOOLEAN_KEYS.indexOf(key) !== -1) {
        obj[key] = !!obj[key];
      }
      if (typeof value === "object") {
        expandResult(value);
      }
    }
  }
  return obj;
};

const JSON_KEYS = [
  "meta", "profile", "participation_meta",
  "expertise", "working_on", "tags", "needed_expertise",
  "windows_focus", "devices_focus", "dynamics_focus",
  "third_party_platforms_focus", "cloud_enterprise_focus",
  "consumer_services_focus", "office_focus", "misc_focus",
  "other_focus", "interests", "executive_challenges", "reporting_data"
];

const stringifyKeys = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(stringifyKeys);
  } else {
    for (const key in obj) {
      if (JSON_KEYS.indexOf(key) !== -1) {
        obj[`json_${key}`] = JSON.stringify(obj[key]);
        delete obj[key];
      }
    }
  }
  return obj;
};

const isDocs = (path) => {
  return path.indexOf("/documentation") === 0;
};

const register = function (server, options, next) {
  server.ext("onPreResponse", (request, reply) => {
    if (!isDocs(request.url.path)) {
      expandResult(request.response.source);
    }
    return reply.continue();
  });

  server.ext("onPreHandler", (request, reply) => {
    if (!isDocs(request.url.path)) {
      stringifyKeys(request.payload);
    }
    return reply.continue();
  });

  next();
};

register.attributes = {
  name: "expand-meta",
  version: "1.0.0"
};

export default { register };
