const cookieParser = require("cookie-parser");
const OAuthServer = require("oauth2-server");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const cors = require("cors");
const config = require("./config");
const session = require("./middlewares/session")(config.sessionSecret);
const authenticate = require("./oauth/authenticate");

const port = process.env.PORT || 3000;
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.database, config.options, err => {
  console.log("Connected to mongodb.");
});

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session);

app.use(cors());

require("./routes")(app);

// stage1: tested authentication
app.get("/", authenticate(), function(req, res) {
  res.json({ message: "Welcome to the jungle!", user: req.session.user });
});

// stage2 : tested scope
app.get("/profile", authenticate({ scope: "profile" }), function(req, res) {
  res.json(req.user);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.stack);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(port, () => console.log(`Server running @ ${port}`));
