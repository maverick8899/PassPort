var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Account = require("./models/account.model");
const session = require("express-session");

var app = express(); //

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/// passport asdsad
app.use(
  session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.KEY_SESSION,
    // cookie: {
    //   maxAge: 10000,
    // },
    store: session.MemoryStore(),
  })
);
app.use(passport.initialize());
app.use(passport.session());
//
app.get("/", (req, res, next) => {
  res.render("index", { title: "KimBang" });
});
app.get("/home", (req, res, next) => {
  //nếu req.user hợp lệ
  if (req.isAuthenticated()) {
    return res.json(req.session);
  }
  res.json("fail");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      try {
        const user = await Account.findOne({ email: username });
        if (!user) {
          done(null, false);
        }
        done(null, user); //next serializeUser
      } catch (error) {
        done(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  console.log("serializeUser", user);
  return done(null, user.email);
});
passport.deserializeUser(async (username, done) => {
  console.log("deserializeUser");
  try {
    const user = await Account.findOne({ email: username });
    //kiểm tra username ở cookie nếu hợp lệ thì gán vào req.user => isAuthenticated()
    if (username === user.email) {
      return done(null, user.email);
    }
    done(null, false);
  } catch (error) {
    done(error);
  }
});

//asdasds
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
