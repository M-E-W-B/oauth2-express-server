const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "OAuthAccessToken",
  new Schema({
    accessToken: String,
    accessTokenExpiresAt: Date,
    scope: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    client: { type: Schema.Types.ObjectId, ref: "OAuthClient" }
  })
);
