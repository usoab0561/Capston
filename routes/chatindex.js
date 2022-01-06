var io = require("../index");
var allchatroomsarray = require("../index");

var mongoose = require("mongoose");
var express = require("express");

var router = express.Router();
var roomsarray = [];
var usernamearray = [];
var roomscount;
var boolarray = true;

// Connect to mongo chat server
//mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
//mongoose.connect(process.env.MONGO_DB, function(err, db){
mongoose.connect(process.env.MONGO_DB, function (err, db) {
  if (boolarray) {
    idname = db.collection("users");

    // testval = db.getCollectionNames().filter(function (c) { return c.indexOf('chats') == 0; })
    //console.log(testval);

    // Get chats from mongo collection 몽고에서 가져오는것. 처음에 전체유저 싹다 가져오는 역할만.
    idname.find().forEach(function (myDoc) {
      // console.log(myDoc.ID);
      roomsarray.push(myDoc.ID); // ID를 가져와 넣기
      usernamearray.push(myDoc.username);
      roomscount = roomsarray.length;
      //console.log("콜랙션가져오는거 횟수 테스트합니다?"); // 한번 실행되고 안되게 잘 되는구만, 물론 한번들어올때 3~4번 실행되긴하지만.

      boolarray = false;
    });
  }
  // if('<%= isAuthenticated %>'){

  //   }else{
  //     alert('로그인 먼저 하세요!');
  //     window.location.replace='http://www.localhost:3000/login/';
  //   }

  // 처음 DB연결했을때 채팅방에 이용할 chatroom 모두 가져옴.
  mongoose.connection.db
    .listCollections({ name: /^chats/ }, { nameOnly: true })
    .toArray(function (err, names) {
      // chats로 시작하는거 다 가져옴. filter은 정규식name은 only option사용
      allchatroomsarray = names;
      for (var i in names) {
        // 객체 가져오면 name즉 채팅방이름만 collection에서 가져옴 ex chats/bubble2jh,bubble3jh

        // console.log(allchatroomsarray[i].name);
        allchatroomsarray[i] = allchatroomsarray[i].name;
      }
      //console.log(allchatroomsarray);
    });

  //mongoose.connect("mongodb+srv://master:1234@boomerangdb.6v75j.mongodb.net/chatdb", function(err, db){
  //  mongoose.connect(process.env.MONGO_DB, function(err, db){   // MONGO_DB는 Heroku Settings에서 설정 / 환경변수에서 설정. 해로쿠할땐이렇게
  console.log("MongoDB connected to Chat");

  // Connect to Socket.io
  // client.on('connection', function(socket){
  //연결이 들어오면 실행되는 이벤트
  // socket 변수에는 실행 시점에 연결한 상대와 연결된 소켓의 객체가 들어있다.
  io.sockets.on("connection", function (socket) {
    let chat;

    for (let i = 0; i < roomscount; i++) {
      // 채팅 방 만들기. 버튼으로 할때필요 + possiblerooms 만들고 emit해줄거임.
      for (let j = i + 1; j < roomscount; j++) {
        //console.log(`${i + 1},${j + 1}`);
      }
    }

    // app.use(function(req,res,next){
    //     res.locals.isAuthenticated = req.isAuthenticated();
    //     res.locals.currentUser = req.user;
    //     res.locals.util = util;
    //     next();
    //   });

    // res.render("home/chatindex",{
    //     roomscount: roomscount,
    //     usernamearray: usernamearray,
    //     roomsarray: roomsarray
    // })

    module.exports = roomscount;
    module.exports = usernamearray;
    //console.log(roomscount);
    //console.log(usernamearray);
    socket.emit("exportroomscount", roomscount);
    socket.emit("exportusernamearray", usernamearray);

    socket.on("possiblerooms", (possiblerooms) => {
      //possiblerooms
      //allchatroomsarray
      //console.log(possiblerooms);
      // 교집합 해버린다.
      let finalroom = possiblerooms.filter((x) =>
        allchatroomsarray.includes(x)
      ); // 결과 2, 3
      //console.log(finalroom);
      socket.emit("finalroom", finalroom);
    });

    // 룸 전환 신호, joinRoom을 클라이언트한데 받으면
    socket.on("joinRoom", (roomname, roomToJoin) => {
      // console.log(
      //   "서버에서 원래 룸네임-> " +
      //     roomname +
      //     "에서 " +
      //     roomToJoin +
      //     "룸으로  실행됐다."
      // );
      socket.leave(roomname); // 기존의 룸을 나가고
      socket.join(roomToJoin); // 들어갈 룸에 들어간다.

      // 룸을 성공적으로 전환했다는 신호 발송
      socket.emit("roomChanged", roomToJoin);
      chat = db.collection("chats/" + roomname);
      // Get chats from mongo collection 몽고에서 가져오는것. 처음에 싹다 가져오는 역할만.
      chat
        .find()
        .limit(100)
        .sort({ _id: 1 })
        .toArray(function (err, res) {
          if (err) {
            throw err;
          }

          // Emit the messages
          socket.emit("output", res);
        });
    });

    //socket.emit으로 현재 연결한 상대에게 신호를 보낼 수 있다.
    socket.emit("usercount", io.engine.clientsCount);
    //기본적으로 채팅방 하나에 접속시켜준다. 이게 필요가 읎지. 일단 무조건 채팅방을 골라야 시작하는걸로
    //socket.join("채팅방 1");

    // let chat = db.collection('chats');

    // Create function to send status
    sendStatus = function (s) {
      socket.emit("status", s);
    };

    // Handle input events 인풋하라고 서버에 명령이 들어오면,
    // (on 함수로 이벤트를 정의해 신호를 수신할 수 있다)
    socket.on("input", function (data) {
      // 매개변수 roomname 데이터에 추가했음.
      let name = data.name;
      let message = data.message;
      let roomname = data.roomname; // 매개변수 roomname 데이터에 추가했음.

      //console.log(roomname + "zz"); // 서버에 채팅방이 보여지긴하네. (채팅방1)

      // // Check for name and message
      // if(name == '' || message == ''){
      //     // Send error status
      //     sendStatus('이름과 메세지를 입력하세요');
      // } else {
      // Insert message
      // 그러니까 몽고디비에 메세지를 넣어주고, 클라이언트에서는 몽고디비에있는거를 가져오는거 뿐이네.
      chat.insert({ name: name, message: message }, function () {
        // name이랑, message를 db에 insert하는거다! 100%
        //io.sockets.emit('output', [data]);  // 이건 클라이언트에 다시 output으로 보내는 역할일 뿐. 위 줄이 DB에 넣는거임
        io.sockets.to(roomname).emit("output", [data]); // 그니까 같은 roomname있는곳에 emit해준다.

        // Send status object
        sendStatus({
          message: "메세지 보내짐",
          clear: true,
        });
      });
      // }
    });

    // // Handle clear
    // socket.on('clear', function(data){
    //     // Remove all chats from collection
    //     chat.remove({}, function(){
    //         // Emit cleared
    //         socket.emit('cleared');
    //     });
    // });
  });
});

// // 디버그 신호를 주고받는 네임스페이스
// const debug = io.of('/debug');

// // 네임스페이스의 연결 처리는 제각각이다. 그러므로 연결 콜백을 다시 만들어야 한다.
// debug.on('connection', (socket) => {
//   // 룸의 목록 요청시 / 네임스페이스의 룸 목록 반환
//   socket.on('getRooms', () => {
//     // 다른 네임스페이스의 객체에도 접근할 수 있다.
//     socket.emit('rooms', io.sockets.adapter.rooms);
//   });
// });

// const messageSchema = {
//   name: String,
//   message: String
// };

// const Item = mongoose.model("Item", messageSchema);

// app.get("/", function(req,res){
//   res.render("list", {listTitle: "Today", newListItems: items});
// });

module.exports = router;
