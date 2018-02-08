const session = require("express-session");
const RedisSessionStore = require("connect-redis")(session);

module.exports = sessionSecret =>
  session({
    store: new RedisSessionStore(),
    secret: sessionSecret,
    unset: "destroy",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  });
