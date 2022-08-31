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
    //암호화 하는 부분 hash에 1번째 인자로 암호화할꺼
    //2번째 인자 default값이 10으로 암호화를 어렵게 만드는 정도라고 생각하면됨
    //3번째 인자로 화살표함수 1번째 arg: err, 2번쨰 arg: hash
    // 저 hash가 복호화 된 거임.
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
            //아이디 생성하자마자 바로 로그인되도록 설정
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
