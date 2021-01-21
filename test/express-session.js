var express = require("express");
var parseurl = require("parseurl");
var session = require("express-session"); //세션 미들웨어는 request 객체의 프로퍼티로 session 객체 추가
var FileStore = require("session-file-store")(session);
var app = express();

app.use(
  session({
    secret: "keyboard cat!@!~!@~!@",
    resave: false, //세션 변경없어도 매번 저장
    saveUninitialized: true, //세션이 필요하기 전까진 구동x
    store: new FileStore(),
  })
);
app.get("/", function (req, res, next) {
  if (req.session.num === undefined) req.session.num = 1;
  else req.session.num++;
  res.send(`view : ${req.session.num}`);
});
/*
app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {};
  }

  // get the url pathname
  var pathname = parseurl(req).pathname;

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

  next();
});

app.get("/foo", function (req, res, next) {
  res.send("you viewed this page " + req.session.views["/foo"] + " times");
});

app.get("/bar", function (req, res, next) {
  res.send("you viewed this page " + req.session.views["/bar"] + " times");
});
*/

app.listen(3000, () => {
  console.log("3000!");
});
