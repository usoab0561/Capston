var mongoose = require("mongoose");
var Counter = require("./Counter");

// schema
var chatSchema = mongoose.Schema({
  chatcontents: [
    {
      chater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      }, //채팅자 아이디
      contents: { type: String }, //대화 내용
      chatdate: { type: Date, default: Date.now }, // 후기 작성 날짜
    },
  ],
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }, //채팅방 생성자 아이디
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }, //채팅방 수신자 아이디
  numId: { type: Number }, //채팅방 아이디
});

// model & export
var Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;
