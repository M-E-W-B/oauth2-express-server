const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "OAuthRefreshToken",
  new Schema({
    refreshToken: String,
    refreshTokenExpiresAt: Date,
    scope: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    client: { type: Schema.Types.ObjectId, ref: "OAuthClient" }
  })
);
