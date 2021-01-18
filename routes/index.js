const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");
const auth = require("../lib/auth.js");

router.get("/", (req, res) => {
  //사실은 이 콜백 함수도 미들웨어였다!
  let title = "Welcome";
  let description = "Hello, Node.js";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src = "/images/hello.jpg" style = "width:500px; display:block; margin-top:10px">`,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(req, res)
  );
  // response.writeHead(200);
  // response.end(html);
  res.send(html);
});

module.exports = router;
