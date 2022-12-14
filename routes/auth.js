module.exports = function (passport) {
  var express = require("express");
  var router = express.Router();
  var shortid = require("shortid");
  var template = require("../lib/template.js");
  var db = require("../lib/db");
  var bcrypt = require("bcrypt");
  router.get("/login", function (request, response) {
    var fmsg = request.flash();
    var feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error;
    }
    var title = "WEB - login";
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `,
      ""
    );
    response.send(html);
  });

  router.post(
    "/login_process",
    passport.authenticate("local", {
      failureFlash: true,
      successFlash: true,
      failureRedirect: "/auth/login",
    }),
    (req, res) => {
      req.session.save(() => {
        res.redirect("/");
      });
    }
  );

  router.get("/register", function (request, response) {
    var fmsg = request.flash();
    var feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = "WEB - login";
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
        <div style="color:red;">${feedback}</div>
        <form action="/auth/register_process" method="post">
          <p><input type="text" name="email" placeholder="email" value="egoing7777@gmail.com"></p>
          <p><input type="password" name="pwd" placeholder="password" value="111111"></p>
          <p><input type="password" name="pwd2" placeholder="password" value="111111"></p>
          <p><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
          <p>
            <input type="submit" value="register">
          </p>
        </form>
      `,
      ""
    );
    response.send(html);
  });

  router.post("/register_process", function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    var existedEmail = db.get("users").find({ email }).value();
    var existedName = db.get("users").find({ displayName }).value();
    //????????? ?????? ?????? hash??? 1?????? ????????? ???????????????
    //2?????? ?????? default?????? 10?????? ???????????? ????????? ????????? ???????????? ???????????????
    //3?????? ????????? ??????????????? 1?????? arg: err, 2?????? arg: hash
    // ??? hash??? ????????? ??? ??????.
    bcrypt.hash(pwd, 10, (err, hash) => {
      if (pwd !== pwd2) {
        request.flash("error", "Password must same!");
        response.redirect("/auth/register");
      } else {
        if (existedEmail) {
          request.flash("error", "Existed eamil, change please");
          response.redirect("/auth/register");
        } else {
          if (existedName) {
            request.flash("error", "Existed nickName, change please");
            response.redirect("/auth/register");
          } else {
            var user = {
              id: shortid.generate(),
              email,
              password: hash,
              displayName,
            };
            db.get("users").push(user).write();
            //????????? ?????????????????? ?????? ?????????????????? ??????
            request.login(user, (err) => {
              if (err) throw err;
              console.log("redirect");
              return response.redirect("/");
            });
          }
        }
      }
    });
  });

  router.get("/logout", function (request, response) {
    request.logout();
    request.session.save(function () {
      response.redirect("/");
    });
  });
  return router;
};
