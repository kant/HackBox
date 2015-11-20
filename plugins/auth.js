/*eslint no-invalid-this: 0, camelcase: [2, {"properties": "never"}] */
import BearerAuthorization from "hapi-auth-bearer-simple";
import aad from "azure-ad-jwt-mod";
import { credentials } from "../data/mock-data";

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
  // to enable simpler testing since we can't programmatically
  // generate valid tokens for multiple users
  if (process.env.NODE_ENV === "test") {
    if (token === "super") {
      return next(null, true, cleanCredentials(credentials.super));
    }
    if (token === "regular") {
      return next(null, true, cleanCredentials(credentials.regular));
    }
  }

  aad.verify(token, null, (err, result) => {
    if (result) {
      // verify issuer, clientId (app) and user
      return next(null, true, cleanCredentials(result));
    } else {
      return next(null, false, null);
    }
  });
};

const register = function (plugin, options, next) {
  // create a `request.isSuperUser()` methdd for inside handlers
  plugin.decorate("request", "isSuperUser", function () {
    if (this.auth.credentials && this.auth.credentials.scope.indexOf("admin") !== -1) {
      return true;
    }
    return false;
  });

  plugin.decorate("request", "userId", function () {
    return this.auth.credentials && this.auth.credentials.id || null;
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
