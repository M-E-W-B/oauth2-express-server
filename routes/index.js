const oauthServer = require("oauth2-server");
const OAuthClient = require("../models/oauth-client");
const oauth = require("../oauth/instance");
const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = app => {
  app.all("/oauth/token", function(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    oauth
      .token(request, response)
      .then(token => res.json(token))
      .catch(next);
  });

  app.post("/authorise", function(req, res, next) {
    console.log(req.session);
    const request = new Request(req);
    const response = new Response(res);

    return oauth
      .authorize(request, response, {
        // to be implemented as mentioned in the oauth2 specs
        authenticateHandler: {
          handle: function(request, response) {
            return request.session.user;
          }
        }
      })
      .then(success => res.json(success))
      .catch(next);
  });

  app.get("/authorise", function(req, res, next) {
    const { client_id: clientId, redirect_uri: redirectUri } = req.query;

    return OAuthClient.findOne({ clientId, redirectUri })
      .then(model => res.json(model))
      .catch(next);
  });
};
