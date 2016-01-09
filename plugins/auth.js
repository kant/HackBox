/*eslint no-invalid-this: 0, camelcase: [2, {"properties": "never"}] */
import BearerAuthorization from "hapi-auth-bearer-simple";
import Boom from "boom";
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

  /*

    WARNING!

    BEFORE GOING TO PRODUCTION YOU MUST REMOVE THIS!

    the `if (true)`

    should be replaced with

    `if (process.env.NODE_ENV === "test") {`

    so that this only works in TEST mode.

  */

  if (true) { // eslint-disable-line
    if (token === "super" || token === "regular" || token === "regular2") {
      return next(null, true, cleanCredentials(credentials[token]));
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
