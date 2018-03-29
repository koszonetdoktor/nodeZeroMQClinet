// Hello World client
// Connects REQ socket to tcp://localhost:5555
// Sends "Hello" to server.

var zmq = require('zeromq');

// socket to talk to server

var requester = zmq.socket('req');
var subber = zmq.socket("sub")
console.log("connect to pub")
subber.connect("tcp://localhost:5556");

subber.subscribe('ge'); // felismerem, de nem értem miért nem tudom szépen kiolvasni akkor :(
console.log('Subscriber connected to port 5556');

subber.on('message', function(topic, message) {
  console.log(topic.toString("utf8"));
});

var x = 0;

console.log("Connecting to the server...");
requester.connect("tcp://localhost:5555");

console.log("Sending Start request");
requester.send("start");

let step = 0;

requester.on("message", function(reply) {
  console.log(reply.toString());
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

setTimeout(function() {
  requester.send("stopp");
  console.log("Stop message is sent!")
  step = 2;
},10000);

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
  } else if(reply === "er") {
    console.error("error occured!");
  } else if(reply === "uk") {
    console.warn("Server didnt understand the message!");
  } else {
    console.warn("unknown reply from the server");
  }
}
