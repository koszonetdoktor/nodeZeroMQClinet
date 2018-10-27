// Hello World client
// Connects REQ socket to tcp://localhost:5555
// Sends "Hello" to server.
//TODO make E2E teszt here

var zmq = require('zeromq');
var readline = require("readline-sync");
// socket to talk to server

var requester = zmq.socket('req');
var subber = zmq.socket("sub")
console.log("connect to pub")
subber.connect("tcp://localhost:5556");

subber.subscribe(''); // felismerem, de nem értem miért nem tudom szépen kiolvasni akkor :(
console.log('Subscriber connected to port 5556');

let adsDataArray = []
subber.on('message', function(data) {
  //console.log("raw:", data);
  //console.log(data.toString("utf8"));
  //console.log(data.toString("ascii"));
  //console.log(data.toString("binary"));
  //console.log(data.toString("base32"));
  //console.log(data.toString("base64"));
  //console.log(data.toString("hex"));
    
    //console.log("converted:", hexToBytes(data.toString("hex")))
    console.log(data);
    console.log(data.toString("hex"))
   let dataArray = hexToBytes(data.toString("hex"))
    //console.log(dataArray);
 // mainWindow.send("ads-data", adsDataArray);
});

function hexToBytes(hex) { 
    // took 0.020ms - 0.250ms 
    for (var bytes = [], c = 0; c < hex.length; c += 8) // start from the 2 to cut down the firs byte, it is kinda dummy
    bytes.push(parseInt(hex.substr(c, 8), 16));
    //console.timeEnd("convert")
    return bytes;
}

function reverse(s){
    return s.split("").reverse().join("");
}


var x = 0;

console.log("Connecting to the server...");
let ret = requester.connect("tcp://localhost:5555");
console.log("ret", ret);
console.log("Sending Start request");
requester.send("start");

let step = 0;

requester.on("message", function(reply) {
  console.log("message", reply.toString());
  switch(step) {
    case 0: // getting answer for the performed subscription
      evaluateReply(reply);
      break;
    case 1: // we are getting the values 
      console.log("val: ", reply);
      break;
    case 2:
      evaluateReply(reply);
      break;
  }
});

var name = readline.question("What is your name?");
requester.send("stopp");
step = 2;
// setTimeout(function() {
//   requester.send("stopp");
//   console.log("Stop message is sent!")
//   step = 2;
// },5000);

process.on('SIGINT', function() {
  requester.close();
});

function evaluateReply(reply) {
  if(reply.includes("ok")) {
    console.log("Reply was ok");
    if(step === 2) {
      console.log("Process is done!");
      requester.close();
      process.exit();
    }
  } else if(reply.includes("er")) {
    console.error("error occured!");
  } else if(reply.includes("uk")) {
    console.warn("Server didnt understand the message!");
  } else {
    console.warn("unknown reply from the server");
  }
}
