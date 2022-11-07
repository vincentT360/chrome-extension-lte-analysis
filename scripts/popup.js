// function delay(time){
//   return new Promise(resolve => {
//       setTimeout(resolve, time);
//   });
// }

//This hogs the main thread so we get better times
function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
  }
}

//IP addr for capturing packets:
//https://www.nslookup.io/domains/https%3A%2F%2Fsocketsbay.com%2Ftest-websockets/webservers/

//Can also test what we are sending by going here and pressing connect, then in our extension send requests
//https://socketsbay.com/test-websockets
const socket = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/')
function connect(){
    return new Promise(function(resolve, reject) {
      var server = new WebSocket('wss://socketsbay.com/wss/v2/2/demo/')
      server.onopen = function() {
        console.log("success")
        resolve(server);
      };
      server.onerror = function(err) {
        reject(err)
      }
    })

}

//By putting this outside of a function, when extension is opened via popup, we establish connection first
let server = await connect();

async function sendWebSocket(){

  socket.send("hi1")
  //var start = new Date().getTime()
  wait(5);
  //var end = new Date().getTime()
  //console.log(start-end)
  socket.send("hi2")
}

//Note: We have to do getElementById b/c chrome does not allow inline scripting like onclick=myfunction() in HTML
//Basically, all scripting needs to stay in the js file
document.getElementById("sendRequest").addEventListener("click", sendWebSocket);