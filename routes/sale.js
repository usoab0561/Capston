var express = require("express");
var router = express.Router();
// 필요한 DataBase -> History, User, File (사진)
var History = require("../models/history");
var User = require("../models/User");
var Post = require("../models/Post");
var util = require("../util");
// file(image) 보여주기
var File = require("../models/File");

/* 판매 내역 페이지 show*/
router.get("/:username", util.isLoggedin, async function (req, res) {
  History.find({ author: req.params.username })
    .populate({ path: "attachment", match: { isDeleted: false } }) // file과 history relationship 생성
    .exec(function (err, historys) {
      if (err) res.json(err);
      //console.log(historys);
      res.render("history/sale2", {
        historys: historys,
        username: req.params.username,
      });
    });
});

/* 내가 작성한 게시물 목록 페이지 show */
router.get("/:username/mytrade", util.isLoggedin, async function (req, res) {
  // user의 Object_id를 가져옴
  var userid = req.user._id;

  Post.find({ author: userid })
    .populate({ path: "attachment", match: { isDeleted: false } })
    .exec(function (err, posts) {
      if (err) req.json(err);
      //console.log(posts.attachment);
      res.render("history/mytrade", {
        posts: posts,
        username: req.params.username,
      });
    });
});

/* 나의 거래 후기 목록 */
router.get("/:username/myreview", util.isLoggedin, async function (req, res) {
  res.render("history/myreview", { username: req.params.username });
});

/*거래 완료 버튼 누를 때 -> history에 추가 되면서 posts에서 삭제  */
/* create -> 거래 내역을 추가한다. posts에서 해당 게시물 삭제 */

router.post("/:username/:post_id", util.isLoggedin, async function (req, res) {
  
  var post = await Post.findOne({ _id: req.params.post_id }).populate({
    path: "attachment",
  });
  //console.log("find post_id:" + post.attachment._id);

  // post와 relation된 file 찾기
  //var file = await File.find({ _id: post.attachment._id });
  //console.log("find file" + "\n" + file._id);

  req.body.author = req.params.username;
  req.body.title = post.title;
  req.body.contents = post.contents;
  req.body.category = post.category;
  req.body.CreatedAt = Date.now();
  //req.body.attachment = post.attachment;
  req.body.url1 = post.url1;
  req.body.url2 = post.url2;

  console.log(req.body);

  // history에 추가
  History.create(req.body, function (err, history) {
    if (err) {
      req.flash("historys", req.body);
      req.flash("errors", util.parseError(err));
    }
  });

  // post에서 삭제
  Post.deleteOne({ _id: req.params.post_id }, function (err) {
    if (err) return res.json(err);
    res.redirect("/sale/" + req.params.username);
  });
});

module.exports = router;