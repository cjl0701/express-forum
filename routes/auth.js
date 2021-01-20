const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");
const shortid = require("shortid");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ users: [] }).write();

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

  /*
router.post("/login_process", (req, res) => {
  let post = req.body; //by body-parser
  if (post.email === authData.email && post.password === authData.password) {
    req.session.is_logined = true;
    req.session.nickname = authData.nickname; //이는 나중에 세션 스토어에 반영된다.
    //세션 스토어에 저장하는게 리다이렉션보다 느리면 로그인이 안된다.
    //세션 스토어에 바로 저장하게 하는 메소드
    req.session.save(function () {
      res.redirect("/");
    });
  } else res.send("who?");
});
*/

  router.post("/login_process", (req, res, next) => {
    // passport.authenticate("local", {
    //   //successRedirect: "/",
    //   failureRedirect: "/auth/login",
    //   failureFlash: true,
    // })
    passport.authenticate("local", (err, user, info) => {
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
    // req.session.destroy(function (err) {
    //   res.redirect("/");
    // });
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
      db.get("users")
        .push({
          id: shortid.generate(),
          email: post.email,
          pwd: post.pwd,
          nickname: post.displayName,
        })
        .write();
      res.redirect("/");
    }
  });

  return router;
};
