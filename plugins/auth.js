/*eslint no-invalid-this: 0, camelcase: [2, {"properties": "never"}] */
import aad from "azure-ad-jwt-mod";
import BearerAuthorization from "hapi-auth-bearer-simple";
import Boom from "boom";
import crypto from "crypto";
import { credentials as mockCredentials} from "../data/mock-data";
import db from "../db-connection";

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

const loginCache = {
  _CACHE_TIME: 59 * 60 * 1000, // 59 minutes, don't accidentally exceed a token's hour lifetime
  _cache: {},

  put: (authToken, credentials, cb) => {
    const hash = crypto.createHash("md5").update(authToken).digest("hex");
    const expires = credentials.exp;
    loginCache._cache[hash] = {
      credentials,
      expires
    };
    credentials = JSON.stringify(credentials);
    const rawQuery =
      [`INSERT INTO logins values('${hash}', '${credentials}', ${expires})`,
       `ON DUPLICATE KEY UPDATE expires = ${expires};`].join(" ");
    return db.raw(rawQuery).then(() => {
      cb(null);
    });
  },

  get: (authToken, cb) => {
    const hash = crypto.createHash("md5").update(authToken).digest("hex");
    const cached = loginCache._cache[hash];
    const now = Date.now() / 1000 | 0;
    if (cached && cached.expires > now) {
      return cb(null, cached.credentials);
    }
    return db("logins").
      select(["credentials", "expires"]).where({token_hash: hash}).then((result) => {
        if (result[0]) {
          const expires = result[0].expires;
          if (expires < now) {
            return cb("Expired");
          }
          const credentials = JSON.parse(result[0].credentials);

          loginCache._cache[hash] = {
            expires,
            credentials
          };
          return cb(null, credentials);
        }
        return cb("No cache hits");
      });
  }
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
      return next(null, true, cleanCredentials(mockCredentials[token]));
    }
  }

  loginCache.get(token, (getErr, getResult) => {
    if (!getErr && getResult) {
      return next(null, true, cleanCredentials(getResult));
    }

    aad.verify(token, null, (verifyErr, verifyResult) => {
      if (verifyResult) {
        // verify issuer, clientId (app) and user
        loginCache.put(token, verifyResult, () => {
          return next(null, true, cleanCredentials(verifyResult));
        });
      } else {
        return next(null, false, null);
      }
    });
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
