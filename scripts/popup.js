//This hogs the main thread so we get better times
function wait(ms){
  var current = new Date().getTime();
  var target = current + ms;
  while(current < target) {
    current = new Date().getTime();
  }
}

//IP addr for capturing packets:
//https://www.nslookup.io/domains/https%3A%2F%2Fsocketsbay.com%2Ftest-websockets/webservers/

//Can also test what we are sending by going here and pressing connect, then in our extension send requests
//https://socketsbay.com/test-websockets
// const socket = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/')

function connect(){
  return new Promise(function(resolve, reject){
    var server = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/');
    server.onopen = function(){
      console.log("WebSocket connection established");
      connectionEstablished = true;
      resolve(server);
    };
    server.onerror = function(err){
      console.log("WebSocket connection failed");
      reject(err);
    };
  });
}

function sendWebSocket(){
  if(connectionEstablished){
    console.log("Sending request 1 at: " + new Date().getTime());
    server.send("request 1");
    wait(5);
    console.log("Sending request 2 at: " + new Date().getTime());
    server.send("request 2");
  }
  else{
    console.log("Could not send requests because the WebSocket connection failed");
  }
}

//By putting this outside of a function, when extension is opened via popup, we establish connection first
var connectionEstablished = false;
var server = await connect();
document.getElementById("sendRequest").addEventListener("click", sendWebSocket);