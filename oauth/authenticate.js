const oauthServer = require("oauth2-server");
const oauth = require("./instance");
const Request = oauthServer.Request;
const Response = oauthServer.Response;

module.exports = function(options) {
  const options = options || {};

  return function(req, res, next) {
    const request = new Request({
      headers: { authorization: req.headers.authorization },
      method: req.method,
      query: req.query,
      body: req.body
    });
    const response = new Response(res);

    oauth
      .authenticate(request, response, options)
      .then(function(token) {
        // Request is authorized.
        req.user = token;
        next();
      })
      .catch(function(err) {
        // Request is not authorized.
        res.status(err.code || 500).json(err);
      });
  };
};
