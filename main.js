const express = require("express"); //모듈 load
const app = express(); //함수. application 객체 반환
const port = 3000;
const fs = require("fs");
const helmet = require("helmet");

app.use(helmet()); //보안

//정적 파일
app.use(express.static("public")); //public 디렉토리에서 static 파일 찾겠다

//third-party 미들웨어 import
const bodyParser = require("body-parser");
const compression = require("compression");

//미들웨어 작성
let myLogger = function (req, res, next) {
  console.log("LOGGED");
  next(); //앱 내의 다음 미들웨어 함수 호출.
};

//미들웨어 함수 로드. 요청이 들어올 때마다 실행됨
app.use(myLogger); //요청을 받을 때마다 라우팅 전에 콘솔에 "LOGGED" 출력
app.use(bodyParser.urlencoded({ extended: false })); //body-parser가 실행되어 미들웨어 장착
app.use(compression());

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
const authRouter = require("./routes/auth");

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
