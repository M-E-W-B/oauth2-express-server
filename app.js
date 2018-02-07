const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const OAuthServer = require("oauth2-server");
const path = require("path");
const config = require("./config");
const authenticate = require("./oauth/authenticate");
const port = process.env.PORT || 3000;
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.database, config.options, err => {
  console.log("Connected to mongodb.");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require("./routes")(app);

// stage1: tested authentication
app.get("/secure", authenticate(), function(req, res) {
  res.json({ message: "Secure data" });
});

// stage2: tested user
app.get("/me", authenticate(), function(req, res) {
  res.json(req.user);
});

// stage3 : tested scope
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
  console.log(err);
  res.render("error", {
    message: err.message,
    error: err
  });
});

app.listen(port, () => console.log(`Server running @ ${port}`));
