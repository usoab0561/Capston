var mongoose = require('mongoose');

// schema
var commentSchema = mongoose.Schema({
  post:{type:mongoose.Schema.Types.ObjectId, ref:'post', required:true},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  parentComment:{type:mongoose.Schema.Types.ObjectId, ref:'comment'},
  text:{type:String, required:[true,'내용을 입력해주세요.']},
  isDeleted:{type:Boolean},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
},{
  toObject:{virtuals:true}
});

commentSchema.virtual('childComments')
  .get(function(){ return this._childComments; })
  .set(function(value){ this._childComments=value; });

// model & export
var Comment = mongoose.model('comment',commentSchema);
module.exports = Comment;
