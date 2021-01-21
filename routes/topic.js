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
    req.flash("message", "login first");
    return req.session.save(() => res.redirect("/"));
  }
  let title = "topic - create";
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
    req.flash("message", "login first");
    return req.session.save(() => res.redirect("/"));
  }

  let topic = db.get("topics").find({ id: req.params.pageId }).value();

  if (topic.user_id !== req.user.id) {
    req.flash("message", "not your topic!!");
    return req.session.save(() => res.redirect("/"));
  }

  let list = template.list(req.list);
  let html = template.HTML(
    topic.title,
    list,
    `<form action="/topic/update_process" method="post">
      <input type="hidden" name="id" value="${topic.id}">
      <p><input type="text" name="title" placeholder="title" value="${topic.title}"></p>
      <p><textarea name="description" placeholder="description">${topic.description}</textarea></p>
      <p><input type="submit"></p>
    </form>`,
    `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`,
    auth.statusUI(req, res)
  );
  res.send(html);
});

router.post("/update_process", (req, res) => {
  let post = req.body;
  db.get("topics")
    .find({ id: post.id })
    .assign({ title: post.title, description: post.description })
    .write();
  res.redirect(`/topic/${post.id}`);
});

router.post("/delete_process", (req, res) => {
  if (!auth.isOwner(req, res)) {
    req.flash("message", "login first");
    return req.session.save(() => res.redirect("/"));
  }
  let post = req.body;
  let topic = db.get("topics").find({ id: post.id }).value();
  if (topic.user_id !== req.user.id) {
    req.flash("message", "not your topic!!");
    return req.session.save(() => res.redirect("/"));
  }
  db.get("topics").remove({ id: post.id }).write();
  res.redirect("/");
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
      <a href="/topic/update/${topic.id}">update</a>
      <form action="/topic/delete_process" method="post">
        <input type="hidden" name="id" value="${topic.id}">
        <input type="submit" value="delete">
      </form>`,
    auth.statusUI(req, res)
  );
  res.send(html);
});

module.exports = router;
