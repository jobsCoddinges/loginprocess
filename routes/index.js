var express = require("express");
var router = express.Router();
var template = require("../lib/template.js");
var auth = require("../lib/auth");

router.get("/", function (request, response) {
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var fmsg = request.flash();
  var realmsg = "";
  if (fmsg.error) {
    realmsg = fmsg.error;
  }
  var html = template.HTML(
    title,
    list,
    `
      <div style="color:red;">${realmsg}</div>
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
    `<a href="/topic/create">create</a>`,
    auth.statusUI(request, response)
  );
  response.send(html);
});

module.exports = router;
