import { WebSocketServer } from 'ws';
import { hrtime } from 'node:process';
import {performance} from 'perf_hooks';

const wss = new WebSocketServer({ port: 8080 });

// Used to hold our current received connection
var wsConnection = null;
// Used to keep track of the 2 packets and their timings
var packet1Time = null;
var packet2Time = null;

wss.on('connection', function connection(ws) {
    console.log("Client connected")

    //Wipe packet tracking times if not wiped
    packet1Time = null;
    packet2Time = null;
  
    //Bind the incoming connection
    wsConnection = ws;

    //Bind the function to when our websocket receives the message
    ws.on('message', handleMessage);
});

//This function is called when a message is received

function handleMessage(data) {
  var timeReceived = performance.now();
  var splitData = data.toString().split(" ");
  var requestType = splitData[0];
  if(requestType == "o"){
    console.log(`Received: ${data} at ${timeReceived}`);
    wsConnection.send(data + timeReceived.toString());
    return;
  }
  else if(requestType == "g"){
    var packetType = splitData[1];
    if(packetType == "1"){
      console.log(`Received small packet at ${timeReceived}`);
    }
    else if(packetType == "2"){
      console.log(`Received big packet at ${timeReceived}`);
    }
  }
  else if(requestType == "p"){
    console.log(`Received: ${data} at ${timeReceived}`);
  }
  //This performs necessary logic to keep track of packet times
  if (packet1Time == null && packet2Time == null) {
    packet1Time = timeReceived;
  }
  else if (packet1Time != null && packet2Time == null) {
    packet2Time = timeReceived;
    //Difference in milliseconds
    var differenceInMS = 0;
    if((packet2Time-packet1Time) >= 0){
      differenceInMS = (packet2Time-packet1Time);
    }
    else{
      differenceInMS = (packet1Time-packet2Time);
    }
    console.log(`Gap: ${differenceInMS}`);

    //Set reply message
    var replyMessage = "";
    if(requestType == "g"){
      replyMessage = requestType + " " + differenceInMS.toString();
    }
    else if(requestType == "p"){
      replyMessage = data + " " + differenceInMS.toString();
    }
    console.log(replyMessage);
    console.log('\n');
    wsConnection.send(replyMessage);

    //Reset both times so we can be ready for the next incoming packet pair.
    packet1Time = null;
    packet2Time = null;
  }
  else {
    console.log("ERROR: Packets received out of order")
  }
}
