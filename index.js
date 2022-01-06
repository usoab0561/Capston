var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
// passport를 사용하여 로그인 후 유저 정보를 session에 저장
var session = require("express-session");
// config 파일 아래의 passport를 require
var passport = require("./config/passport");
var util = require("./util");
var app = express();

var server = require("http").createServer(app); // 채팅
var io = require("socket.io")(server);
module.exports = server;
module.exports = io;

// DB setting
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
//var MONGO_DB="mongodb+srv://jinho:456798ab@cluster0.twnvx.mongodb.net/TokkiGmarket?retryWrites=true&w=majority";
mongoose.connect(
  process.env.MONGO_DB
);

var db = mongoose.connection;
db.once("open", function () {
  console.log("DB connected");
});
db.on("error", function (err) {
  console.log("DB ERROR : ", err);
});

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // 실제 사용될 콜백 함수 return
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({ secret: "MySecret", resave: true, saveUninitialized: true }));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares - 로그인 기능
app.use(function (req, res, next) {
  /* res.locals에 담은 변수는 바로 ejs에서 사용 가능*/

  // 현재 로그인이 되었는지, 아닌지를 true, false로
  res.locals.isAuthenticated = req.isAuthenticated();
  // 로그인이 되면 session으로 부터 user를 deserialize -> user 정보를 가져옴
  res.locals.currentUser = req.user;
  // utill.js에서 정의한 함수를 가져오기 위해
  res.locals.util = util;
  // 반드시 next를 넣어줘야 다음으로 진행
  next();
});

//mongodb insert
/*
var history = db.collection('historys');
history.insert({
  title:"의류 팔아요",
  contents: "안입는 의류 팔아요",
  author: "bubble3js",
  numId: 40,
  category: "의류"
});*/

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", util.getPostQueryString, require("./routes/posts"));
app.use("/users", require("./routes/users"));
app.use("/comments", util.getPostQueryString, require("./routes/comments"));
app.use("/files", require("./routes/files"));
app.use("/sale", require("./routes/sale"));
app.use("/police", require("./routes/police"));
app.use("/chatindex", require("./routes/chatindex"));
app.use("/reviews", util.getPostQueryString, require("./routes/reviews"));

// Port setting
var port = process.env.PORT || 3000; // 수정
server.listen(port, function () {
  console.log("server on! http://localhost:" + port);
});
