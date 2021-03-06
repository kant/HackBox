/*eslint no-invalid-this: 0, camelcase: [2, {"properties": "never"}] */
// import aad from "azure-ad-jwt-mod";
import BearerAuthorization from "hapi-auth-bearer-simple";
import Boom from "boom";
import crypto from "crypto";
import { credentials as mockCredentials} from "../data/mock-data";
import db from "../db-connection";
import jwt from "jsonwebtoken";

const cleanCredentials = (credsObject) => {
  return {
    email: credsObject.email,
    family_name: credsObject.family_name,
    given_name: credsObject.given_name,
    name: credsObject.name,
    id: credsObject.oid,
    scope: credsObject.roles
  };
};

export const validate = function (token, next) {
  jwt.verify(token, process.env.SESSION_SECRET, function(err, decoded) {
    if (err) {
      return next(null, false);
    } else if (decoded) {
      return next(null, true, decoded);
    } else {
      return next(null, true, {});
    }

  });
};

const register = function (plugin, options, next) {
  // create a `request.isSuperUser()` methdd for inside handlers
  plugin.decorate("request", "isSuperUser", function () {
    if (this.auth.credentials &&
      this.auth.credentials.scope &&
      this.auth.credentials.scope.indexOf("admin") !== -1) {
      return true;
    }
    return false;
  });

  plugin.decorate("request", "userId", function () {
    return this.auth.credentials && this.auth.credentials.id || null;
  });

  // only super users can ever request `include_deleted` as
  // a query param
  plugin.ext("onPreHandler", (request, reply) => {
    if (request.query.omit_user && !request.isSuperUser()) {
      return reply(Boom.forbidden("only super users can pass 'omit_user'"));
    }

    if (request.query.include_deleted && !request.isSuperUser()) {
      return reply(Boom.forbidden(`You must be an admin to request deleted data`));
    }

    return reply.continue();
  });

  plugin.register(BearerAuthorization, () => {
    plugin.auth.strategy("bearer", "bearerAuth", {
      validateFunction: validate
    });
    next();
  });
};

register.attributes = {
  name: "authentication",
  description: "This is the authentication provider"
};

export default { register };
