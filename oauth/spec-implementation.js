// Model Specs here:
// http://oauth2-server.readthedocs.io/en/latest/model/spec.html#

const OAuthAccessToken = require("./models/oauth-accesstoken");
const OAuthRefreshToken = require("./models/oauth-refreshtoken");
const OAuthAuthorizationCode = require("./models/oauth-authorizationcode");
const OAuthClient = require("./models/oauth-client");
const User = require("./models/user");
const OAuthSpec = {};

// accessToken [String]
OAuthSpec.getAccessToken = accessToken => {
  return OAuthAccessToken.find({ accessToken })
    .populate("user")

    .populate("client");
};

// refreshToken [String]
OAuthSpec.getRefreshToken = refreshToken => {
  return OAuthRefreshToken.find({ refreshToken })
    .populate("user")
    .populate("client");
};

// authorizationCode [String]
OAuthSpec.getAuthorizationCode = authorizationCode => {
  return OAuthAuthorizationCode.find({ authorizationCode })
    .populate("user")
    .populate("client");
};

// clientId [String], clientSecret [String]
OAuthSpec.getClient = (clientId, clientSecret) => {
  const options = { clientId };

  if (clientSecret) options.clientSecret = clientSecret;

  return OAuthClient.find(options);
};

// username [String], password [String]
OAuthSpec.getUser = (username, password) => {
  return User.findOne({ username }).then(user => {
    return user.validPassword(password) ? user : false;
  });
};

// client [Object] : only used for client_credentials grant type
OAuthSpec.getUserFromClient = ({ clientId }) => {
  return OAuthClient.findOne({ clientId }).populate("user");
};

// token [Object], client [Object], user [Object]
OAuthSpec.saveToken = (token, clientObj, userObj) => {
  const {
    accessToken,
    accessTokenExpiresAt,
    scope,
    refreshToken,
    refreshTokenExpiresAt
  } = token;
  const { _id: client } = clientObj;
  const { _id: user } = userObj;
  const oAuthAccessToken = new OAuthAccessToken({
    accessToken,
    accessTokenExpiresAt,
    client,
    user,
    scope
  });

  const promises = [oAuthAccessToken.save()];

  // no refresh token for client_credentials
  if (refreshToken) {
    const oAuthRefreshToken = new OAuthRefreshToken({
      refreshToken,
      refreshTokenExpiresAt,
      client,
      user,
      scope
    });
    promises.push(oAuthRefreshToken.save());
  }

  return Promise.all(promises).then(() => ({
    ...token,
    ...{
      client: clientObj,
      user: userObj
    }
  }));
};

// code [Object], client [Object], user [Object]
OAuthSpec.saveAuthorizationCode = (code, clientObj, userObj) => {
  const { expiresAt, scope, authorizationCode } = code;
  const { _id: client } = clientObj;
  const { _id: user } = userObj;

  // @TODO: check the code and authorizationCode thing
  const oAuthAuthorizationCode = new OAuthAuthorizationCode({
    expiresAt,
    client,
    authorizationCode,
    user,
    scope
  });

  return oAuthAuthorizationCode.save();
};

// token [Object] : Invoked to revoke a refresh token.
OAuthSpec.revokeToken = token => {
  const { refreshToken } = token;

  return OAuthRefreshToken.findOne({
    refreshToken
  })
    .lean()
    .then(function(rT) {
      //if (rT) rT.destroy();
      // set a previous date
      token.refreshTokenExpiresAt = new Date("2015-05-28T06:59:53.000Z");
      return token;
    });
};

// code [Object]
OAuthSpec.revokeAuthorizationCode = codeObj => {
  const { code } = codeObj;

  return OAuthAuthorizationCode.findOne({
    code
  })
    .lean()
    .then(function() {
      // set a previous date
      codeObj.expiresAt = new Date("2015-05-28T06:59:53.000Z");
      return codeObj;
    });
};

// user [Object], client [Object], scope [String]: Invoked to check if the requested scope is valid for a particular client/user combination.
OAuthSpec.validateScope = (user, client, scope) => {
  return user.scope === scope && client.scope === scope && scope !== null
    ? scope
    : false;
};

module.exports = OAuthSpec;
