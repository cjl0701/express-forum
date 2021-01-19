const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");

router.get("/login", (req, res) => {
  let title = "WEB - login";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
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

router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

module.exports = router;
