const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "OAuthClient",
  new Schema({
    name: String,
    clientId: String,
    clientSecret: String,
    redirectUris: [String],
    grants: [
      {
        type: String,
        enum: [
          "authorization_code",
          "password",
          "refresh_token",
          "client_credentials"
        ]
      }
    ],
    scope: String,
    User: { type: Schema.Types.ObjectId, ref: "User" }
  })
);
