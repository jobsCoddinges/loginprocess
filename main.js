var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var helmet = require("helmet");
var db = require("./lib/db");
app.use(helmet());
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var flash = require("connect-flash");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "asadlfkj!@#!@#dfgasdg",
    resave: false,
    saveUninitialized: true,
    // store: new FileStore(),
  })
);
app.use(flash());

var passport = require("./lib/passport")(app);

//passport를 통해 성공했을때 어디로 갈지 실패했을때 어디로 갈지 설정.

app.get("*", function (request, response, next) {
  request.list = db.get("topics").value();
  next();
});

var indexRouter = require("./routes/index");
var topicRouter = require("./routes/topic");
var authRouter = require("./routes/auth")(passport);
const auth = require("./lib/auth");
const { response } = require("express");

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
