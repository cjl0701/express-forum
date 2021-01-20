const express = require("express");
const router = express.Router();
const fs = require("fs");
const template = require("../lib/template.js");
const auth = require("../lib/auth.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const db = require("../lib/db.js");
const shortid = require("shortid");

//router 객체에 미들웨어 설치
router.get("/create", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false; //더 진행되지 않도록 리턴.
  }
  let title = "WEB - create";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
     <form action="/topic/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p><textarea name="description" placeholder="description"></textarea></p>
      <p><input type="submit"></p>
     </form>
    `,
    "",
    auth.statusUI(req, res)
  );
  res.send(html);
});

router.post("/create_process", (req, res) => {
  let post = req.body;
  let id = shortid.generate();
  db.get("topics")
    .push({
      id: id,
      title: post.title,
      description: post.description,
      user_id: req.user.id,
    })
    .write();
  res.redirect(`/topic/${id}`);
});

router.get("/update/:pageId", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false; //더 진행되지 않도록 리턴.
  }
  let title = req.params.pageId;
  fs.readFile(`data/${title}`, "utf8", function (err, description) {
    let list = template.list(req.list);
    let html = template.HTML(
      title,
      list,
      `
        <form action="/topic/update_process" method="post">
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
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
      auth.statusUI(req, res)
    );
    res.send(html);
  });
});

router.post("/update_process", (req, res) => {
  let post = req.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      res.redirect(`/topic/${title}`);
    });
  });
});

router.post("/delete_process", (req, res) => {
  if (!auth.isOwner(req, res)) {
    res.redirect("/");
    return false; //더 진행되지 않도록 리턴.
  }
  let post = req.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    res.redirect("/");
  });
});

router.get("/:pageId", (req, res, next) => {
  let topic = db.get("topics").find({ id: req.params.pageId }).value();
  let sanitizedTitle = sanitizeHtml(topic.title);
  let sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ["h1"],
  });
  let list = template.list(req.list);
  let author = db.get("users").find({ id: topic.user_id }).value().nickname;
  let html = template.HTML(
    sanitizedTitle,
    list,
    `<h2>${sanitizedTitle}</h2>${sanitizedDescription}<p>by ${author}</p>`,
    ` <a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action="/topic/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`,
    auth.statusUI(req, res)
  );
  res.send(html);
});

module.exports = router;
