import BearerAuthorization from 'hapi-auth-bearer-simple'
import aad from 'azure-ad-jwt'

const validate = function(token, next) {
    aad.verify(token, null, (err, result) => {
      if (result) {
        next(null, true, {});
      } else {
        next(null, false, null);
      }
    });
}

const register = function(plugin, options, next) {
    plugin.register(BearerAuthorization, () => {
        plugin.auth.strategy('bearer', 'bearerAuth', {
            validateFunction: validate
        })
        next()
      })
}

register.attributes = {
    "name": "authentication",
    "description": "This is the authentication provider",
}
export default { register };
