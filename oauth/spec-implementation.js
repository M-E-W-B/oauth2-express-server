// Model Specs here:
// http://oauth2-server.readthedocs.io/en/latest/model/spec.html#

const {
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthAuthorizationCode,
  OAuthClient,
  User
} = require("../models");
const OAuthSpec = {};

// accessToken [String]
OAuthSpec.getAccessToken = accessToken => {
  console.log("getAccessToken", accessToken);
  return OAuthAccessToken.findOne({ accessToken })
    .populate("user")
    .populate("client");
};

// refreshToken [String]
OAuthSpec.getRefreshToken = refreshToken => {
  console.log("getRefreshToken", refreshToken);
  return OAuthRefreshToken.findOne({ refreshToken })
    .populate("user")
    .populate("client");
};

// code [String]
OAuthSpec.getAuthorizationCode = authorizationCode => {
  console.log("getAuthorizationCode", authorizationCode);
  return OAuthAuthorizationCode.findOne({ authorizationCode })
    .populate("user")
    .populate("client");
};

// clientId [String], clientSecret [String]
OAuthSpec.getClient = (clientId, clientSecret) => {
  console.log("getClient", { clientId, clientSecret });
  const options = { clientId };

  if (clientSecret) options.clientSecret = clientSecret;

  return OAuthClient.findOne(options);
};

// username [String], password [String]
OAuthSpec.getUser = (username, password) => {
  console.log("getUser", { username, password });
  return User.findOne({ username }).then(user => {
    return user.validPassword(password) ? user : false;
  });
};

// client [Object] : only used for client_credentials grant type
OAuthSpec.getUserFromClient = ({ clientId }) => {
  console.log("getUserFromClient", clientId);
  return OAuthClient.findOne({ clientId }).populate("user");
};

// token [Object], client [Object], user [Object]
OAuthSpec.saveToken = (token, clientObj, userObj) => {
  console.log("saveToken", { token, clientObj, userObj });
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
  console.log("saveAuthorizationCode", { code, clientObj, userObj });
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
  console.log("revokeToken", token);
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
  console.log("revokeAuthorizationCode", codeObj);
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

// accessToken [Object], scope [String]
OAuthSpec.verifyScope = (accessToken, scope) => {
  console.log("verifyScope", { accessToken, scope });
  return accessToken.scope === scope;
};

module.exports = OAuthSpec;
