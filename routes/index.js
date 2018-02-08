const querystring = require("querystring");
const oauthServer = require("oauth2-server");
const ServerError = require("oauth2-server/lib/errors/server-error");
const InvalidRequestError = require("oauth2-server/lib/errors/invalid-request-error");
const UnauthorizedRequestError = require("oauth2-server/lib/errors/unauthorized-request-error");
const { OAuthClient, User } = require("../models");
const oauth = require("../oauth/instance");

const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = app => {
  // provides token
  app.post("/oauth/token", function(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    oauth
      .token(request, response)
      .then(token => res.json(token))
      .catch(next);
  });

  // login page
  app.get("/login", function(req, res, next) {
    const data = {
      response_type: req.query.response_type,
      client_id: req.query.client_id,
      redirect_uri: req.query.redirect_uri,
      scope: req.query.scope,
      state: req.query.state
    };

    // check for user in the session
    if (!req.session.user) {
      return res.render("./pages/login", data);
    } else {
      const query = querystring.stringify(data);
      return res.redirect(`/authorise?${query}`);
    }
  });

  // login api
  app.post("/login", async function(req, res, next) {
    const { username, password } = req.body;
    const data = {
      response_type: req.body.response_type,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri,
      scope: req.body.scope,
      state: req.body.state
    };

    // check for both username and password
    if (!username || !password) {
      const query = querystring.stringify(data);
      return res.redirect(`/login?${query}`);
    }

    let user;
    try {
      user = await User.findOne({ username });
    } catch (e) {
      next(e);
    }

    if (user && user.validPassword(password)) req.session.user = user;
    else
      next(
        new UnauthorizedRequestError(
          "Unauthorized Request: Invalid Account Credentials"
        )
      );

    // Check for authorization grant type
    if (response_type === "code") {
      const query = querystring.stringify(data);
      return res.redirect(`/authorize?${query}`);
    } else {
      // @TODO: redirect to redirect_uri
      res.json({
        message: "You have been logged in successfully!"
      });
    }
  });

  // authorise page
  app.get("/authorize", async function(req, res, next) {
    const data = {
      response_type: req.query.response_type,
      client_id: req.query.client_id,
      redirect_uri: req.query.redirect_uri,
      scope: req.query.scope,
      state: req.query.state
    };

    // check for the user in session
    if (!req.session.user) {
      const query = querystring.stringify(data);
      return res.redirect(`/login?${query}`);
    }

    // clientId is a must
    if (!data.client_id) {
      return next(
        new UnauthorizedRequestError(
          "Unauthorized Request: No ClientId provided."
        )
      );
    }

    let client;
    try {
      client = await OAuthClient.findOne({ clientId: data.client_id });
    } catch (e) {
      return next(e);
    }

    // check if client exists
    if (!client) {
      return next(
        new UnauthorizedRequestError(
          "Unauthorized Request: ClientId doesn't exist."
        )
      );
    }

    data.client_name = client.name;
    return res.render("./pages/authorize", data);
  });

  // authorize api
  app.post("/authorize", async function(req, res, next) {
    if (!(hasAuthorized && hasAuthorized === "on")) {
      // @TODO - redirect the user from he/she came
      return res.json({ message: "Why you no want to authorize?" });
    }

    const hasAuthorized = req.body.authorized;
    const data = {
      response_type: req.body.response_type,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri,
      scope: req.body.scope,
      state: req.body.state
    };

    // check for user in session
    if (!req.session.user) {
      const query = querystring.stringify(data);
      return res.redirect(`/login?${query}`);
    }

    // Client Id is a must
    if (!data.client_id) {
      return next(
        new UnauthorizedRequestError(
          "Unauthorized request: No ClientId provided"
        )
      );
    }

    let client;
    try {
      client = await OAuthClient.findOne({ clientId: data.client_id });
    } catch (e) {
      return next(e);
    }

    // check if client exists
    if (!client) {
      return next(
        new UnauthorizedRequestError(
          "Unauthorized Request: ClientId doesn't exist."
        )
      );
    }

    const request = new Request(req);
    const response = new Response(res);

    return oauth
      .authorize(request, response, {
        // implemented as mentioned in the oauth2 specs
        authenticateHandler: {
          handle: function(request, response) {
            return request.session.user;
          }
        }
      })
      .then(success => res.json(success))
      .catch(next);
  });

  // logout
  app.post("/logout", function(req, res, next) {
    req.session.destroy(err => {
      res.clearCookie("connect.sid", { path: "/" });
      return res.redirect("/login");
    });
  });
};
