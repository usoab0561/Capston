var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var User = require('../models/User');

var client = require("../utils/client");
const { smart_function, web3 } = client;

// chat
router.get('/chat', function(req, res){
  res.render('home/chat');
});

// chatindex
router.get('/chatindex', function(req, res){
  res.render('home/chatindex');
});
// chatindex post // chatejs로 tochatuser과 chatroom을 보내줌.
router.post('/chatindex', function(req, res) {
  var chatroom = req.body.chatroom;
  var tochatuser = req.body.tochatuser;
  // res.redirect('/chat');
  res.render('home/chat', { tochatuser: tochatuser, chatroom: chatroom});
});


// report
router.get('/report', function(req, res){
  res.render('home/report');
});
router.get('/report1', function(req, res){
  res.render('home/report1');
});

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',function(req,res,next){
  var errors = {};
  var isValid = true;

  if(!req.body.username){
    isValid = false;
    errors.username = '아이디를 입력하세요.';
  }
  if(!req.body.password){
    isValid = false;
    errors.password = '비밀번호를 입력하세요.';
  }

  // 유효하지 않음
  if(!isValid){
    req.flash('errors',errors);
     return res.redirect('/login');
  }
  // is valid
  next();

},
passport.authenticate('local-login', {
  //successRedirect : '/posts',
  failureRedirect : '/login'
}),

function(req, res){
  var errors = {};
  /* polic 계정이 들어왔을 때 */
  if(req.body.username == "bubble1jh"){
    console.log("police")
    return res.redirect('/police');
  }
  //return res.redirect('/posts');
  
  // 일반 사용자의 경우 ip 주소 확인
  else {

    //res.redirect('/posts');

    User.findOne({username: req.body.username}, async function(err,user){
      if(err) return res.json(err);


      console.log(user);

      console.log(user.blockhash);

      // contract 호출
      var login = await smart_function.check_login(user.blockhash);

      console.log('login');
      console.log(login);
      //  ip 인증
      // 0일시 로그인 불가능
      if(login == 0){
        errors.ip_check = "ip 인증을 진행해주세요";
        req.flash('errors', errors);
        return res.redirect('users/addip');
      }
      // 1일시 로그인 가능
      else if(login == 1){
        res.redirect('/posts');
        //next();
      }
      else{
        return res.json(err);
      }
    })
  }
  
});

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

// private function
function check_police(req, res, next){

  User.findOne({username:req.body.username}, function(err, user){

    console.log(user.username);
    if(err) res.json(err);
    if(user.username == "bubble1jh"){
      next();
    }
  });

}
