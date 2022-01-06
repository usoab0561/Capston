var Web3 = require ('web3');
var ip = require("ip");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var address = '0x4fc8f5961BB8fa7a7Ba05C810357fc7A46Bb7930' //BLOCK_ADD
var contract = new web3.eth.Contract([
   {
      "constant": false,
      "inputs": [],
      "name": "setAdmis",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "",
            "type": "uint256"
         }
      ],
      "name": "ips",
      "outputs": [
         {
            "name": "ip",
            "type": "string"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "index",
            "type": "string"
         }
      ],
      "name": "get_Ip",
      "outputs": [
         {
            "name": "ip",
            "type": "string[]"
         },
         {
            "name": "length",
            "type": "uint256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "index",
            "type": "string"
         },
         {
            "name": "_ip_address",
            "type": "string"
         }
      ],
      "name": "Check_ip",
      "outputs": [
         {
            "name": "",
            "type": "int256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [],
      "name": "getaccount",
      "outputs": [
         {
            "name": "_index",
            "type": "uint256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": false,
      "inputs": [
         {
            "name": "_identify",
            "type": "string"
         }
      ],
      "name": "Add_already_identify",
      "outputs": [
         {
            "name": "",
            "type": "int256"
         }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "identify",
            "type": "string"
         }
      ],
      "name": "check_authentication",
      "outputs": [
         {
            "name": "",
            "type": "int256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "index",
            "type": "uint256"
         }
      ],
      "name": "check",
      "outputs": [
         {
            "name": "",
            "type": "bool"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "identify",
            "type": "string"
         }
      ],
      "name": "is_exist",
      "outputs": [
         {
            "name": "",
            "type": "int256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "index",
            "type": "string"
         }
      ],
      "name": "getName",
      "outputs": [
         {
            "name": "_user_name",
            "type": "string"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": false,
      "inputs": [
         {
            "name": "index",
            "type": "string"
         },
         {
            "name": "_user_ip",
            "type": "string"
         }
      ],
      "name": "AddIp",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "",
            "type": "uint256"
         }
      ],
      "name": "Own_User",
      "outputs": [
         {
            "name": "name",
            "type": "string"
         },
         {
            "name": "identify",
            "type": "string"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": false,
      "inputs": [
         {
            "name": "_user_name",
            "type": "string"
         },
         {
            "name": "_user_identify",
            "type": "string"
         }
      ],
      "name": "setInfo",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "",
            "type": "uint256"
         }
      ],
      "name": "Own_admis",
      "outputs": [
         {
            "name": "alloReference",
            "type": "bool"
         },
         {
            "name": "BlockNo",
            "type": "uint256"
         },
         {
            "name": "allow_addr",
            "type": "int256"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "constant": true,
      "inputs": [
         {
            "name": "index",
            "type": "string"
         }
      ],
      "name": "getIdentify",
      "outputs": [
         {
            "name": "_identify",
            "type": "string"
         }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
   },
   {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
   }
],'0xf6714d3FD7e5E9cd3F0b94f9a9043e5B94B02F3b',{from : address});

var smart_function = {};

// 인덱스 호출 함수, 회원가입 시 저장
smart_function.get_account = async function(){

   var account;
   account = await contract.methods.getaccount().call().then(value =>{
      //console.log(value.result);
      return value;
   });

   console.log(account);
   account = account -1 ;
   return account;
}

// 회원가입 안됐으면, 신원 인증 먼저 진행하라는 메시지
// 회원가입 할 때
// 회원가입했으면, 진행
smart_function.set_ip = async function(index){
   var p =ip.address();
   console.log(typeof(p));
   p = p.toString();
   var index = index;
   contract.methods.AddIp(index ,p).send({from : address , gas : 3000000},function(e,r){
      console.log(e);
      console.log(r);
   });
}

smart_function.getName = async function(index) {
   var index = index;
   var n1 = await contract.methods.getName(index).call({from : address}).then(value =>{
      //console.log(value.result);
      return value;
   });
   //document.getElementById("n1").innerHTML=n1;

   console.log(n1);
   return n1;
}

smart_function.getNum = async function(index) {

   var index = index;
   var num1 = await contract.methods.getIdentify(index).call({from : address}).then(value =>{
      //console.log(value.result);
      return value;
   });
   //document.getElementById("num1").innerHTML=num1;
   console.log(num1);
   return num1;
}

smart_function.check_login = async function(index){
   var index = index;
   //var p = ip();
   console.log(index);
   var p =ip.address();
   p = p.toString();
   console.log(p);
   //q = "jiwon";
   var login = await contract.methods.Check_ip(index, p).call().then(value => {
   console.log(value);
   return value;
   }
)

   console.log('contract login')
   console.log(login);

return login;

} // 0이면 유효하지 않은 ip 회원가입 불가능 하도록. 1이면 회원 가입 가능

//ip 주소 추가할 때
smart_function.is_exist = async function(res){
   var exist = await contract.methods.is_exist(res).call().then(value =>{
      return value;
})
return exist;
// 2이면 신원 인증 X , 3이면 IP추가 가능
}

smart_function.add_ip = async function(index){
   var p =ip.address();
   p = p.toString();
   var index = index;


   await contract.methods.AddIp(index,p).send({from : address },function(e,r){console.log(r);});
   // Ip추가 함.
}


smart_function.get_name = async function(index){

   var name = contract.methods.getName(index).call().then(value => {return value;})

   return name
   // 경찰이 이름, 주민번호 출력

}

smart_function.get_num = async function(index){


   var res = contract.methods.getIdentify(index).call().then(value => {return value;})
   return res;
   // 경찰이 이름, 주민번호 출력

}

module.exports = {
    web3,
    smart_function
};
