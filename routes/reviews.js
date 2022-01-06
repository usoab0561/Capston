var express  = require('express');
var router = express.Router();
var multer = require('multer');
var passport = require('../config/passport');
var Review = require('../models/Review');
var User = require('../models/User');
var util = require('../util');

// Index
router.get('/', async function(req, res){

  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page)?page:1;
  limit = !isNaN(limit)?limit:10;

  var skip = (page-1)*limit;
  var maxPage = 0;
  var searchQuery = await createSearchQuery(req.query);
  var reviews = [];
  var receiver = req.body.receiver;
  //var authorstr = req.body.authorstr;

  if(searchQuery) {
    var count = await Review.countDocuments(searchQuery);
    maxPage = Math.ceil(count/limit);
    reviews = await Review.find(searchQuery)
      .populate('author')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  res.render('reviews/index', {
    reviews:reviews,
    receiver:receiver,
    //authorstr:authorstr,
    currentPage:page,
    maxPage:maxPage,
    limit:limit,
    searchType:req.query.searchType,
    searchText:req.query.searchText,
  });
});
// // review부분에 post기능을 이용해서 채팅목록에 있는 toreceiver의 내용을 보내줍니다 for use ejs ㅎㅎㅎ
// router.post('/reviews', function(req, res) {
//   var toreceiver = req.body.toreceiver;
//   console.log('이사람한데 이제 가는겁니다' + toreceiver);
//   res.render('reviews/new', { toreceiver: toreceiver});

// });
//router.post('/index', function(req, res) {
  //var receiver = req.body.receiver;

  //res.redirect('reviews/index', { receiver: receiver });
//});

// New - 새로운 게시판 글 작성 페이지로 넘어감
router.get('/new', util.isLoggedin, function(req, res){
  var review = req.flash('review')[0] || {};
  //var receiver = req.body.receiver;
  var errors = req.flash('errors')[0] || {};
  res.render('reviews/new', { review:review, errors:errors });
});
//router.post('/new', util.isLoggedin, function(req, res){
  //var review = req.flash('review')[0] || {};
  //var receiver = req.body.receiver;
  //var errors = req.flash('errors')[0] || {};
  //res.render('reviews/new', { review:review, receiver:receiver, errors:errors });
//});

router.get('/reviewindex', function(req, res){
  res.render('reviews/reviewindex');
});

router.get("/:username/myreview", util.isLoggedin, async function (req, res) {
  var receiverid = req.params.username;
  //var author = req.body.author;

  Review.find({ receiver: receiverid })
    .populate('author')
    .exec(function (err, reviews) {
      if (err) req.json(err);
      res.render('reviews/myreview', {
        //author: author,
        reviews: reviews });
    });
});

// create - 새로운 게시판 글 생성 posts에 추가 ㅎㅎ
router.post('/reviewindex', function(req, res){
  req.body.author = req.user._id; // 2
  var receiver = req.body.receiver;
  //var authorstr = req.body.authorstr;

  //res.redirect('reviews/new', { receiver: receiver });
  Review.create(req.body, function(err, review){
    //if(err){
      //req.flash('review', req.body);
      //req.flash('errors', util.parseError(err));
      //return res.redirect('/reviews'+res.locals.getPostQueryString());
    //}
    console.log(receiver);
    //res.redirect('/reviews'+res.locals.getPostQueryString(false, { page:1, searchText:'' }), {receiver:receiver});
    res.redirect('/reviews/reviewindex?toreceiver=' + receiver);
    console.log(req.body);
  });
  //console.log(req.body);

});

// show - 게시판 글의 상세 목록 보여주기
router.get('/:id', function(req, res){
  Review.findOne({_id:req.params.id}) // 3
    .populate('author')             // 3
    .exec(function(err, review){      // 3
      if(err) return res.json(err);
      res.render('reviews/show', {review:review});
    });
});

module.exports = router;

async function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 1){
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if(searchTypes.indexOf('author!')>=0){
      var user = await User.findOne({ userid: queries.searchText }).exec();
      if(user) postQueries.push({author:user._id});
    }
    else if(searchTypes.indexOf('author')>=0){
      var users = await User.find({ userid: { $regex: new RegExp(queries.searchText, 'i') } }).exec();
      var userIds = [];
      for(var user of users){
        userIds.push(user._id);
      }
      if(userIds.length>0) postQueries.push({author:{$in:userIds}});
    }
    if(postQueries.length>0) searchQuery = {$or:postQueries};
    else searchQuery = null;
  }
  return searchQuery;
}