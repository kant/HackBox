import BearerAuthorization from 'hapi-auth-bearer-simple'

const validate = function(token, callback) {
    callback(null, true, null);
}

const register = function(plugin, options, next) {
    plugin.register(BearerAuthorization, () => {
        plugin.auth.strategy('bearer', 'bearerAuth', {
            validateFunction: validate
        })
      })
}

register.attributes = {
    "name": "authentication",
    "description": "This is the authentication provider",

}
export default { register };
