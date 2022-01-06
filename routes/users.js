var express = require("express");
var router = express.Router();
var User = require("../models/User");
var util = require("../util");
// contract
var client = require("../utils/client");
const { smart_function, web3 } = client;

// New
router.get("/new", function (req, res) {
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("users/new", { user: user, errors: errors });
});

router.get("/identity", function (req, res) {
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("users/identity", { user: user, errors: errors });
});

// ip 주소 추가 page로
router.get("/addip", function (req, res) {
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("users/addip", { user: user, errors: errors });
});

// ip 주소 추가
router.post('/addip', async function(req, res){

  console.log(req.body);
  num = req.body.residentnum1 +'-' +req.body.residentnum2;
  var check = await smart_function.is_exist(num);

  console.log(check);

  // 신원 인증 x => 로그아웃 && 신원 확인이 안된다는 메세지 
  if(check == 2){
    return res.redirect('/logout');
  }
  // ip 추가 가능
  else if(check == 3){

    console.log("ip 추가");
    await smart_function.add_ip(req.user.blockhash);
    return res.redirect('/logout');
  }

});

// create
router.post("/", async function (req, res) {
  //var blockchain = await smart_function.get_account();
  //console.log(typeof(blockchain));

  //우선 blockhash를 required true안함

  // blockhash의 type: Number
  req.body.blockhash = await smart_function.get_account();
  var index = req.body.blockhash ;
  index = index.toString();
  

  console.log(req.body);

  // create: 회원 생성
  User.create(req.body, function (err, user) {
    if (err) {
      console.log("error");
      console.log(err);
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/users/new");
    }
    // 해당 user가 생성될 시, ip주소setting
    if(user){
      // contract의 ip setting
      smart_function.set_ip(index);
      console.log(user);
      return res.redirect("/");
    }
  });
});

// show -> user의 마이페이지
router.get("/:username", util.isLoggedin, checkPermission, function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    res.render("users/show", { user: user });
  });
});

// edit -> 프로필 수정 페이지
router.get(
  "/:username/edit",
  util.isLoggedin,
  checkPermission,
  function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
      User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/edit", {
          username: req.params.username,
          user: user,
          errors: errors,
        });
      });
    } else {
      res.render("users/edit", {
        username: req.params.username,
        user: user,
        errors: errors,
      });
    }
  }
);

router.get(
  "/:username/report",
  util.isLoggedin,
  checkPermission,
  function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
      User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/report", {
          username: req.params.username,
          user: user,
          errors: errors,
        });
      });
    } else {
      res.render("users/report", {
        username: req.params.username,
        user: user,
        errors: errors,
      });
    }
  }
);

router.get(
  "/:username/report1",
  util.isLoggedin,
  checkPermission,
  function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
      User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/report1", {
          username: req.params.username,
          user: user,
          errors: errors,
        });
      });
    } else {
      res.render("users/report", {
        username: req.params.username,
        user: user,
        errors: errors,
      });
    }
  }
);

// update
router.put(
  "/:username",
  util.isLoggedin,
  checkPermission,
  function (req, res, next) {
    User.findOne({ userid: req.params.username })
      .select("password")
      .exec(function (err, user) {
        if (err) return res.json(err);

        // update user object
        user.originalPassword = user.password;
        user.password = req.body.newPassword
          ? req.body.newPassword
          : user.password;
        for (var p in req.body) {
          user[p] = req.body[p];
        }

        // save updated user
        user.save(function (err, user) {
          if (err) {
            req.flash("user", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/users/" + req.params.username + "/edit");
          }
          res.redirect("/users/" + user.username);
        });
      });
  }
);

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    if (user.username != req.user.username) return util.noPermission(req, res);
    next();
  });
}