var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var User = require('../models/User');

var client = require("../utils/client");
const { smart_function, web3 } = client;


router.get('/', function(req,res){
  var name = null;
  var resi_num = null;

  return res.render('users/police', {name: name, resi_num: resi_num});

});


router.get('/search', async function(req,res){
  /*
  console.log(req.body.username);
  console.log('들어 오긴 한건가....');*/

  
  User.findOne({username:req.body.username}, async function(err, user){

      if(err) res.json(err);

      if(!user){
          req.flash('error', 'There is no user');
      }
      else {

          console.log(user);
          var index = user.blockhash;
          //getdata(user.blockchain)
          //var ether_account = user.blockchain;
          var name = await smart_function.getName(index);
          var resi_num = await smart_function.getNum(index);
          console.log(name, resi_num);
          return res.render('users/police',{name: name, resi_num: resi_num});
      }

  });


});

module.exports = router;