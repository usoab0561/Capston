var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

// 회원가입 Schema
var userSchema = mongoose.Schema({
  username: {
    type:String,
    required:[true,'사용자 ID를 입력하세요.'],
    match:[/^.{4,12}$/,'4-12자리의 문자를 입력하세요.'],
    trim:true,
    unique:true
  }, //아이디
  password: {
    type:String,
    required:[true,'비밀번호를 입력하세요.'],
    select:false
  }, //비밀번호
  // 이름은 블록체인에 저장
  name: {
    type:String,
    required:[true,'이름을 입력하세요.'], 
    match:[/^.{2,12}$/,'2-12자리의 문자를 입력하세요.'],
    trim:true
  }, //이름
  email: {
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'유효하지 않은 이메일 주소입니다.'],
    trim:true
  },
  address:{
    type: String,
    required:[true, "주소를 입력하세요."],
    trim:true
  }, //주소
  // review default로 null?
  /*
  review: [{
      author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
      }, //거래자 아이디
      contents: { type: String, required: [true, ""] }, //한줄 후기 내용
      createdAt: { type: Date, default: Date.now }, //후기 작성 날짜
    }
  ], //거래후기 document를 embed*/
  createdAt:{
    type:Date,
    default: Date.now
  }, //아이디 생성일자
  scam: {
    type:Number
  }, //사기횟수
  blockhash: {
    type:String,
    /* 이부분 나중에 주석 해제 */
    // required:[true],
  }, //블록체인 주소
  salt: {
    type:String
  }, //비밀번호 보안 강화
},{
  toObject: {virtuals:true} // virtual 스키마 함수 작성시
});

// db에 저장되지 않는 attribute
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// 비밀번호 유효성 검사
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '알파벳과 숫자를 조합하여 8자리 이상 입력하세요.';
userSchema.path('password').validate(function(v) {
var user = this;

// 회원가입
if(user.isNew){
  if(!user.passwordConfirmation){
    user.invalidate('passwordConfirmation', '비밀번호를 다시 입력하세요.');
  }

  if(!passwordRegex.test(user.password)){
    user.invalidate('password', passwordRegexErrorMessage);
  }
  else if(user.password !== user.passwordConfirmation) {
    user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.');
  }
}

// 회원정보 수정
if(!user.isNew){
  if(!user.currentPassword){
    user.invalidate('currentPassword', '현재 비밀번호를 입력하세요.');
  }
  else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
    user.invalidate('currentPassword', '현재 비밀번호가 일치하지 않습니다.');
  }

  if(user.newPassword && !passwordRegex.test(user.newPassword)){
    user.invalidate("newPassword", passwordRegexErrorMessage);
  }
  else if(user.newPassword !== user.passwordConfirmation) {
    user.invalidate('passwordConfirmation', '비밀번호가 일치하지 않습니다.');
  }
}
});

// 비밀번호 hash
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// authenticate 스키마 추가 => 로그인 시, 비밀번호의 hash값이 입력값과 알치하는가
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password); // 입력된 password hash와 db의 hash 비교
};

userSchema.plugin(uniqueValidator, {
  type: 'mongoose-unique-validator',
  message: '이미 사용중인 이름입니다.'
});

// 스키마 등록
var User = mongoose.model('user',userSchema);
module.exports = User;