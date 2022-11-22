//This hogs the main thread so we get better times
function wait(ms){
  var current = performance.now();
  var target = current + ms;
  while(current < target) {
    current = performance.now();
  }
}

function connect(){
  return new Promise(function(resolve, reject){
    var server = new WebSocket('ws://131.179.176.31:8080');
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

//Basic building block to send one request
function sendWebSocket(gap){
  
  if(connectionEstablished){

    server.send("rq 1");
    var time0 = performance.now()
    console.log(time0)
    wait(gap);
    var time1 = performance.now()
    console.log(time1)
    server.send("rq 2");

  }
  else{
    console.log("Could not send requests because the WebSocket connection failed");
  }
}

//This function sends multiple send requests
function sendMultiple() {

  var gap = Number(document.getElementById("timeGap").value);
  resetReceivedTracking();
  
  //Change the number in the for loop to how many times you want to send
  for(let i = 0; i < NUMSENDS; i++) {
    sendWebSocket(gap);
    wait(200);
  }

}

//Reset our global variables
function resetReceivedTracking() {
  totalReceivedMessages = 0;
  receivedGaps = new Map();
  receivedGapsString = "";
  document.getElementById("receivedGap").innerHTML = "";
}

//Generate a table to display to report the receiving gaps
function reportGaps() {
  const sortedTimes = new Map([...receivedGaps].sort((a,b) => a[0] - b[0]));

  const tbl = document.createElement("table");
  tbl.setAttribute("class", "table");
  const tblHead = document.createElement("thead");
  const tblBody = document.createElement("tbody");

  const tblHeadRow = document.createElement("tr");
  const tblHeadCell1 = document.createElement("td");
  const tblHeadCell2 = document.createElement("td");
  const tblHeadCellText1 = document.createTextNode("Time");
  const tblHeadCellText2 = document.createTextNode("Count");

  tblHeadCell1.appendChild(tblHeadCellText1);
  tblHeadCell2.appendChild(tblHeadCellText2);
  tblHeadRow.appendChild(tblHeadCell1);
  tblHeadRow.appendChild(tblHeadCell2);
  tblHead.appendChild(tblHeadRow);
      
  for (let [key, value] of sortedTimes) {

    const row = document.createElement("tr");
    const cellTime = document.createElement("td");
    const cellTimeText = document.createTextNode(key);
    cellTime.appendChild(cellTimeText);
    row.appendChild(cellTime);

    const cellCount = document.createElement("td");
    const cellCountText = document.createTextNode(value);
    cellCount.appendChild(cellCountText);
    row.appendChild(cellCount);
    tblBody.appendChild(row);

  }

  tbl.appendChild(tblHead);
  tbl.appendChild(tblBody);
  document.getElementById("receivedGap").appendChild(tbl);

}

//Below global variables are used to keep track of sends
var totalReceivedMessages = 0;
var receivedGaps = new Map();
var receivedGapsString = "";
const NUMSENDS = 10;

//By putting this outside of a function, when extension is opened via popup, we establish connection first
try {
  var connectionEstablished = false;
  var server = await connect();

  document.getElementById("sendRequest").addEventListener("click", sendMultiple);

  //This fires when we get a message back from the server
  server.onmessage = (event) => {

    //This calculates the received gap into .25 increments and puts them into buckets
    //Used to see what our distribution looks like.
    var receivedGap = Number(event.data)
    var rounded = (Math.round(receivedGap * 4) / 4).toFixed(2);

    if (receivedGaps.has(rounded)) {
      receivedGaps.set(rounded, receivedGaps.get(rounded) + 1);
    } else {
      receivedGaps.set(rounded, 1);
    }

    totalReceivedMessages += 1
    if (totalReceivedMessages == NUMSENDS) {
      reportGaps();
    }
  }
  
} catch(error) {
  document.getElementById("errorMessage").innerHTML = "Can't establish connection"
  console.log(error)
}
