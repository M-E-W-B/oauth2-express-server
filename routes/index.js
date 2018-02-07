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
      .catch(err => res.status(500).json(err));
  });

  app.post("/authorise", function(req, res) {
    const request = new Request(req);
    const response = new Response(res);

    return oauth
      .authorize(request, response, {
        authenticateHandler: {
          handle: function(request, response) {
            // return {
            //   _id: "57382dd6e05342a003543d54",
            //   username: "admin",
            //   password: "admin"
            // };
          }
        }
      })
      .then(success => res.json(success))
      .catch(err => res.status(err.code || 500).json(err));
  });

  app.get("/authorise", function(req, res) {
    const { client_id: clientId, redirect_uri: redirectUri } = req.query;

    return OAuthClient.findOne({ clientId, redirectUri })
      .then(model => res.json(model))
      .catch(err => res.status(err.code || 500).json(err));
  });
};
