const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");
const shortid = require("shortid");
const db = require("../lib/db");

module.exports = function (passport) {
  router.get("/login", (req, res) => {
    let title = "WEB - login";
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
      console.log(`authenticate : ${user}`);
      if (req.session.flash) req.session.flash = {};
      req.flash("message", info.message);
      req.session.save(() => {
        if (err) return next(err);
        if (!user) return res.redirect("/auth/login");
        req.logIn(user, (err) => {
          if (err) return next(err);
          return req.session.save(() => res.redirect("/"));
        });
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
        <p><input type="text" name="displayName" placeholder="display name"></p>
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
      let user = {
        id: shortid.generate(),
        email: post.email,
        pwd: post.pwd,
        nickname: post.displayName,
      };
      db.get("users").push(user).write();
      req.login(user, function (err) {
        req.session.save(() => res.redirect("/"));
      });
    }
  });

  return router;
};
