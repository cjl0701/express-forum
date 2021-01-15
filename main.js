const express = require("express"); //모듈 load
const app = express(); //함수. application 객체 반환
const port = 3000;
const fs = require("fs");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const qs = require("querystring");

//route, routing : path마다 적당한 응답. (기존 코드는 if문으로 구현)
//라우팅: 애플리케이션 엔드 포인트(URI)의 정의, 그리고 URI가 클라이언트 요청에 응답하는 방식
//기본 형식
app.get("/routing", (req, res) => {
  res.send("routing!!");
});
// POST method route
app.post("/", function (req, res) {
  res.send("POST request to the homepage");
});

//clean url : clean URL은 질의어 없이, 경로만 가진 간단한 구조의 URL. 검색 엔진 친화적.
//기본 형식
app.get("/users/:userId/books/:bookId", (req, res) => {
  //http://localhost:3000/users/cjl0701/books/1
  res.send(req.params); //{"userId":"cjl0701","bookId":"1"}
});

app.get("/", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    let title = "Welcome";
    let description = "Hello, Node.js";
    let list = template.list(filelist);
    let html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    // response.writeHead(200);
    // response.end(html);
    res.send(html);
  });
});

app.get("/page/:pageId", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    let filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
      let sanitizedTitle = sanitizeHtml(filteredId);
      let sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      let list = template.list(filelist);
      let html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      res.send(html);
    });
  });
});

app.get("/create", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    let title = "WEB - create";
    let list = template.list(filelist);
    let html = template.HTML(
      title,
      list,
      `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `,
      ""
    );
    res.send(html);
  });
});

app.post("/create_process", (req, res) => {
  let body = "";
  req.on("data", function (data) {
    body = body + data; // 패킷
  });
  req.on("end", function () {
    let post = qs.parse(body);
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      res.writeHead(302, { Location: `/page/${title}` });
      res.end();
    });
  });
});

app.get("/update/:pageId", (req, res) => {
  fs.readdir("./data", function (error, filelist) {
    let title = req.params.pageId;
    fs.readFile(`data/${title}`, "utf8", function (err, description) {
      let list = template.list(filelist);
      let html = template.HTML(
        title,
        list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      res.send(html);
    });
  });
});

app.post("/update_process", (req, res) => {
  let body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  req.on("end", function () {
    let post = qs.parse(body);
    let id = post.id;
    let title = post.title;
    let description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        res.writeHead(302, { Location: `/page/${title}` });
        res.end();
      });
    });
  });
});

app.post("/delete_process", (req, res) => {
  let body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  req.on("end", function () {
    let post = qs.parse(body);
    let id = post.id;
    let filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
      res.writeHead(302, { Location: `/` });
      res.end();
    });
  });
});

app.listen(port, () => {
  //listen이 실행될 때 웹 서버 실행. port 번호로 listening
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
