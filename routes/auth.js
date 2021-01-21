const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");
const shortid = require("shortid");
const db = require("../lib/db");
const bcrypt = require("bcrypt");
const saltRounds = 10; //높을수록 뚫기 어려움

module.exports = function (passport) {
  router.get("/login", (req, res) => {
    let title = "login";
    let list = template.list(req.list);
    let fmsg = req.flash();
    let feedback = "";
    if (fmsg.message) feedback = fmsg.message;
    let html = template.HTML(
      title,
      list,
      `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="submit" value="login"></p>
      </form>
      `,
      ""
    );
    res.send(html);
  });

  router.post("/login_process", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (req.session.flash) req.session.flash = {};
      req.flash("message", info.message);
      if (err) return next(err);
      if (!user) return req.session.save(() => res.redirect("/auth/login"));
      req.logIn(user, (err) => {
        //serialize 호출해 session store에 반영
        if (err) return next(err);
        return req.session.save(() => res.redirect("/"));
      });
    })(req, res, next);
  });

  router.get("/logout", (req, res) => {
    req.logout(); //session 객체의 user를 없애줌
    //세션에 바로 반영
    req.session.save(() => {
      res.redirect("/");
    });
  });

  router.get("/register", (req, res) => {
    let title = "WEB - register";
    let list = template.list(req.list);
    let fmsg = req.flash();
    let feedback = "";
    if (fmsg.message) feedback = fmsg.message;
    let html = template.HTML(
      title,
      list,
      `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password"></p>
        <p><input type="text" name="nickname" placeholder="nickname"></p>
        <p><input type="submit" value="register"></p>
      </form>
      `,
      ""
    );
    res.send(html);
  });

  router.post("/register_process", (req, res) => {
    let post = req.body;
    if (post.pwd !== post.pwd2) {
      req.flash("message", "password must be same!");
      req.session.save(() => res.redirect("/auth/register"));
    } else {
      bcrypt.hash(post.pwd, saltRounds, function (err, hash) {
        let user = {
          id: shortid.generate(),
          email: post.email,
          pwd: hash, //비밀번호를 hash로 저장
          nickname: post.nickname,
        };
        db.get("users").push(user).write();
        req.login(user, function (err) {
          req.flash("message", "join success!!");
          req.session.save(() => res.redirect("/"));
        });
      });
    }
  });

  return router;
};
