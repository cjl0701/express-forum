const express = require("express"); //모듈 load
const app = express(); //함수. application 객체 반환
const port = 3000;
const fs = require("fs");
const helmet = require("helmet");
const session = require("express-session"); //세션 미들웨어는 request 객체의 프로퍼티로 session 객체 추가
const FileStore = require("session-file-store")(session);
//third-party 미들웨어 import
const bodyParser = require("body-parser");
const compression = require("compression");
const flash = require("connect-flash");
//미들웨어 작성
let myLogger = function (req, res, next) {
  console.log("MAIN.JS");
  next(); //앱 내의 다음 미들웨어 함수 호출.
};
//미들웨어 함수 로드. 요청이 들어올 때마다 실행됨
app.use(myLogger); //require 등은 매번 실행x. 얘는 매번 실행.
app.use(helmet()); //보안
app.use(express.static("public")); //public 디렉토리에서 static 파일 찾겠다
app.use(bodyParser.urlencoded({ extended: false })); //body-parser가 실행되어 미들웨어 장착
app.use(compression());
app.use(
  session({
    secret: "keyboard cat!@!~!@~!@",
    resave: false, //세션 변경없어도 매번 저장
    saveUninitialized: true, //세션이 필요하기 전까진 구동x
    store: new FileStore(),
  })
);
app.use(flash());

let passport = require("./lib/passport")(app);

//get 요청에 대해서만 적용되는 미들웨어!
app.get("*", (req, res, next) => {
  fs.readdir("./data", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

//라우터 모듈(미들웨어)
const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

app.use("/", indexRouter);
app.use("/topic", topicRouter); //이 경로에 topicRouter를 미들웨어로서 할당
app.use("/auth", authRouter);

//미들웨어는 순차적으로 처리되기 때문에 맨 밑에!
app.use(function (req, res, next) {
  res.status(404).send("[404] Sorry cant find that!");
});

//next(인자) -> 매개변수 4개짜리 미들웨어 호출
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("[500] Something broke!");
});

//listen이 실행될 때 웹 서버 실행. port 번호로 listening
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/* 이 node.js 기반 코드를 express로 재구성할 것
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      } else {
    } else if(pathname === '/create'){
    } else if(pathname === '/create_process'){
    } else if(pathname === '/update'){
    } else if(pathname === '/update_process'){
    } else if(pathname === '/delete_process'){
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
*/
