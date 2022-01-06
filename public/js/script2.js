// var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var address = '0xEAa4fB0E63dA36C6581bFd17635651f2fa17cD70' //BLOCK_ADD
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
],'0xeE86F552537eC569927f8e3e7d077E8E1e470a58',{from : address,gas : 3000000});

var smart_function = {};

function test(){
   const residentnum = document.getElementById('residentnum').value;
   console.log(residentnum);
   const residentnum2= document.getElementById('residentnum2').value;
   console.log(residentnum2);
   const name1 = document.getElementById('name1').value;
   console.log(name1);
    res = residentnum +'-'+ residentnum2;
    console.log(res)
   contract.methods.setInfo(name1, res).send({from : address , gas : 3000000},function(e,r){
      console.log(e);
      console.log(r);
   });
}


function test2(){
   var p = ip();
   var index = "1";
   console.log(typeof(p));
   console.log(typeof(index));
   contract.methods.AddIp(index ,p).send({from : address , gas : 3000000},function(e,r){
      console.log(e);
      console.log(r);
   });
}

function check_identify(){
    var p = ip();
    console.log(p);

   const residentnum = document.getElementById('residentnum').value;
   console.log(residentnum);
   const residentnum2= document.getElementById('residentnum2').value;
   console.log(residentnum2);
   const name1 = document.getElementById('name1').value;
   console.log(name1);
    res = residentnum +'-'+ residentnum2;
    console.log(res)
    contract.methods.check_authentication(res).call().then(value => {
        console.log(value);
      if(value==1){
            contract.methods.is_exist(res).call().then(value =>{
                if(value==2){
                    console.log(value);
               contract.methods.setInfo(name1, res).send({from : address, gas : 3000000},function(e,r){
                  console.log(e);
                  console.log(r);
               });
      /*      contract.methods.setIdentify(res).send({from : address},function(e,r){
                  console.log(e)
                  console.log(r);
               });
               contract.methods.setIp(p).send({from : address},function(e,r){
                  console.log(e)
                  console.log(r);
               }); */
                    alert("회원가입 가능합니다.");
                     location.href ="/users/new";
                }
                else if(value ==3){
                    console.log(value);
                    alert("이미 가입된 계정입니다."); // 이미 등록된 주민번호
               location.reload();
                }
        })
            // 신원인증 성공 false면 신원인증 X
            }
        else{
            alert("등록되지 않은 주민등록번호입니다.");
         location.reload();

        }
    });
}

function getData(){
   contract.methods.getName().call({from : address}).then(console.log);
   contract.methods.getIdentify().call({from : address}).then(console.log);
   contract.methods.getIp().call({from : address}).then(console.log);
}

async function getName(){
   var n1 = await contract.methods.getName().call({from : address}).then(value =>{
      //console.log(value.result);
      return value;
   });
   document.getElementById("n1").innerHTML=n1;
   var num1 = await contract.methods.getIdentify().call({from : address}).then(value =>{
      //console.log(value.result);
      return value;
   });
   document.getElementById("num1").innerHTML=num1;
}

function getData2(){
   //account = '0x9bde6e856a3E382F6863fa0798394E2540682964'
   contract.methods.getName2('0x9bde6e856a3E382F6863fa0798394E2540682964').call({from : address}).then(console.log);
   contract.methods.getIdentify2('0x9bde6e856a3E382F6863fa0798394E2540682964').call({from : address}).then(console.log);
   contract.methods.getName().call({from : address}).then(console.log);
   contract.methods.getIdentify().call({from : address}).then(console.log);
} // 신고하기

function check_login(){
   var p = ip();
   console.log(p);
   contract.methods.Check_ip(p).call().then(value => {
   console.log(value);
   if(value == 0){
      alert("새로운 ip계정입니다. 다시 본인 인증을 하세요 ");
      location.reload();
   }
            }
      )
}

async function get_account(){
   
   var account; 
   account = await contract.methods.get_account().call().then(value =>{
      return value;
   });
   
   console.log(account);
   
   return account;
}

function add_ip(){
   var p = ip();
   console.log(p);

   const residentnum = document.getElementById('residentnum').value;
   console.log(residentnum);
   const residentnum2= document.getElementById('residentnum2').value;
   console.log(residentnum2);
   res = residentnum +'-'+ residentnum2;
    console.log(res);
   contract.methods.is_exist(res).call().then(value =>{
      if(value==2){
         alert("신원 인증을 먼저 진행하세요.");
         location.href ="/users/identity";
      }
      else if(value ==3){
         console.log(value);
         contract.methods.Add_ip(p).send({from : address },function(e,r){console.log(r);});
         alert("새로운 ip를 추가하였습니다."); 
      }
})
}