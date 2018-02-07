const OAuthServer = require("oauth2-server");

module.exports = new OAuthServer({
  model: require("./spec-implementation")
});
