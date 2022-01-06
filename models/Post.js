var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var postSchema = mongoose.Schema({
  title: { type: String, required: [true, "제목을 입력해주세요."] }, //게시글 제목
  contents: { type: String, required: [true, "내용을 입력해주세요."] }, //게시글 내용
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, //판매자 아이디
  views: { type: Number, default: 0 }, //조회수
  numId: { type: Number }, //아이디
  attachment: { type: mongoose.Schema.Types.ObjectId, ref: "file" }, //첨부파일
  createdAt: { type: Date, default: Date.now }, // 게시날짜
  status: { type: Boolean, default:false }, //flase이면 판매중, true이면 예약중, 거래완료상태는 어차피 posts에서 삭제되기 때문에 넣지않음
  category: { type: String }, //카테고리
  price:{type: String, required: [true, "가격을 입력해주세요"], match:[ /^[0-9]{0,}$/, "숫자로만 입력해주세요"]}, //가격url1:{type:String},
  url1:{type:String},
  url2:{type:String},
});

postSchema.pre('save', async function (next){
  var post = this;
  if(post.isNew){
    counter = await Counter.findOne({name:'posts'}).exec();
    if(!counter) counter = await Counter.create({name:'posts'});
    counter.count++;
    counter.save();
    post.numId = counter.count;
  }
  return next();
});

// model & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;
