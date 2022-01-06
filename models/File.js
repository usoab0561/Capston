var mongoose = require("mongoose");
var fs = require("fs");
var path = require("path");

// Box client setting
var BoxSDK = require("box-node-sdk");
var client;
var boxClientId = process.env.BOX_CLIENT_ID;
var boxAppToken = process.env.BOX_APP_TOKEN;
var isBoxEnabled = boxClientId && boxAppToken;

if (isBoxEnabled) {
  var sdk = new BoxSDK({
    clientID: boxClientId,
    clientSecret: "",
  });
  client = sdk.getBasicClient(boxAppToken);
}

// schema
var fileSchema = mongoose.Schema({
  originalFileName: { type: String }, //첨부파일 업로드시 이름
  serverFileId: { type: String }, //서버에 저장 시 해싱된 아이디
  serverFileName: { type: String }, //서버에 저장된 파일 이름
  size: { type: Number }, //파일 크기
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }, //파일 업로드한 사람
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "post" }, //게시된 게시물 아이디
  isDeleted: { type: Boolean, default: false }, //삭제여부
});

// instance methods
fileSchema.methods.processDelete = function () {
  this.isDeleted = true;
  this.save();
};

fileSchema.methods.getFileStream = async function () {
  if (isBoxEnabled) {
    // using box.com
    try {
      var stream = await client.files.getReadStream(this.serverFileId);
    } catch (err) {
      if (err.statusCode == 404) {
        this.processDelete();
      }
      throw err.statusCode;
    }
    return stream;
  } else {
    // using server file system
    var stream;
    var filePath = path.join(
      __dirname,
      "..",
      "uploadedFiles",
      this.serverFileName
    );
    var fileExists = fs.existsSync(filePath);
    if (fileExists) {
      stream = fs.createReadStream(filePath);
    } else {
      this.processDelete();
    }
    return stream;
  }
};

// model & export
var File = mongoose.model("file", fileSchema);

// model methods
File.createNewInstance = async function (file, uploadedBy, postId) {
  if (isBoxEnabled) {
    // using box.com
    var filePath = path.join(__dirname, "..", "uploadedFiles", file.filename);
    var stream = fs.createReadStream(filePath);
    var boxResponse = await client.files.uploadFile(
      "0",
      `${file.filename}_${file.originalname}`,
      stream
    );
    var uploadedFile = boxResponse.entries[0];

    return await File.create({
      originalFileName: file.originalname,
      serverFileName: file.filename,
      serverFileId: uploadedFile.id,
      size: file.size,
      uploadedBy: uploadedBy,
      postId: postId,
    });
  } else {
    // using server file system
    return await File.create({
      originalFileName: file.originalname,
      serverFileName: file.filename,
      size: file.size,
      uploadedBy: uploadedBy,
      postId: postId,
    });
  }
};

module.exports = File;
