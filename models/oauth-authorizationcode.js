const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "OAuthAuthorizationCode",
  new Schema({
    authorizationCode: String,
    expiresAt: Date,
    scope: String,
    redirectUri: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    client: { type: Schema.Types.ObjectId, ref: "OAuthClient" }
  })
);
