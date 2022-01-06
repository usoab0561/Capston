var mongoose = require("mongoose");
var Counter = require('./Counter');

// schema
var reviewSchema = mongoose.Schema({
  contents: { type: String, required: [true, "내용을 입력하세요."] }, //게시글 내용
  //, required: [true, "내용을 입력하세요."]
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, //후기 작성자
  numId: { type: Number }, //아이디
  createdAt: { type: Date, default: Date.now },
  //receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // 후기 받는
  receiver: { type: String},
  // ㅎㅎ
});

reviewSchema.pre('save', async function (next){
  var review = this;
  if(review.isNew){
    counter = await Counter.findOne({name:'reviews'}).exec();
    if(!counter) counter = await Counter.create({name:'reviews'});
    counter.count++;
    counter.save();
    review.numId = counter.count;
  }
  return next();
});

// model & export
var Review = mongoose.model("review", reviewSchema);
module.exports = Review;
