//This hogs the main thread so we get better times
function wait(ms){
  var current = performance.now();
  var target = current + ms;
  while(current < target) {
    current = performance.now();
  }
}

//Create the actual ws connection to server
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

    server.send(gap);
    var time0 = performance.now()
    console.log(time0)
    wait(gap);
    var time1 = performance.now()
    console.log(time1)
    server.send(gap);

  }
  else{
    console.log("Could not send requests because the WebSocket connection failed");
  }
}

//DEPRECATED: Sends request based on gap input
// function sendMultiROneGap() {

//   var gap = Number(document.getElementById("timeGap").value);
//   resetReceivedTracking();
  
//   //Change the number in the for loop to how many times you want to send
//   for(let i = 0; i < NUMSENDS; i++) {
//     sendWebSocket(gap);
//     wait(200);
//   }

// }

//This function sends multiple requests at multiple gaps
function sendMultiRMultiGap() {

  resetReceivedTracking();

  gaps.forEach(function (g) {

    for(let i = 0; i < NUMSENDS; i++) {
      sendWebSocket(g);
      wait(200);
    }

  })

}

//For this gap we are testing, add the received gap value the server saw
function addDistributionData(sendGap, receivedGap){
  //Code for rounding the receivedGap to the nearest .25
  var rounded = (Math.round(receivedGap * 4) / 4).toFixed(2);

  //Here we will store the receivedGap distribution for this gap
  if (gapsDistribution.has(sendGap)) {
    var internalMap = gapsDistribution.get(sendGap);

    //Store distribution values
    if (internalMap.has(rounded)) {
      internalMap.set(rounded, internalMap.get(rounded) + 1);
    } else {
      internalMap.set(rounded, 1)
    }

    gapsDistribution.set(sendGap, internalMap);

  } else {
    var internalMap = new Map();
    internalMap.set(rounded, 1);
    gapsDistribution.set(sendGap, internalMap);
  }

}

//For this gap we are testing, add the count of if we got this packet within 1ms or not.
function addCountData(sendGap, receivedGap){
  if (gaps1msCount.has(sendGap)){
    var counts = gaps1msCount.get(sendGap);
    if (receivedGap <= 1.0) {
      counts[0] += 1
    } else {
      counts[1] += 1
    }
    gaps1msCount.set(sendGap, counts);
  } else{
    var counts = [0,0]
    if (receivedGap <= 1.0) {
      counts[0] += 1
    } else {
      counts[1] += 1
    }
    gaps1msCount.set(sendGap, counts);
  }
}

//Reset our global variables so we can start a new text
function resetReceivedTracking() {
  numReceivedMessages = 0;
  gapsDistribution = new Map();
  gaps1msCount = new Map();
  document.getElementById("receivedGap").innerHTML = "";
}

//Generate a table to display to report the receiving gaps
function reportGaps() {
  const percentages = [];

  const sortedTimes = new Map([...gaps1msCount].sort((a,b) => a[0] - b[0]));

  const tbl = document.createElement("table");
  tbl.setAttribute("class", "table");
  const tblHead = document.createElement("thead");
  const tblBody = document.createElement("tbody");

  const tblHeadRow = document.createElement("tr");
  const tblHeadCell1 = document.createElement("td");
  const tblHeadCell2 = document.createElement("td");
  const tblHeadCellText1 = document.createTextNode("Time");
  const tblHeadCellText2 = document.createTextNode("Within 1ms");

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

    //Calculate the percentage
    var percentage = (value[0]/(value[0]+value[1])) * 100;
    var modifiedPercentage = percentage.toFixed(2);
    percentages.push(modifiedPercentage);

    const cellCountText = document.createTextNode(`${modifiedPercentage}%`);
    cellCount.appendChild(cellCountText);
    row.appendChild(cellCount);

    tblBody.appendChild(row);
  }

  tbl.appendChild(tblHead);
  tbl.appendChild(tblBody);
  document.getElementById("receivedGap").appendChild(tbl);

  return percentages;

}

function generateChart(percentages){
  const chartDiv = document.getElementById('chartDiv');
  chartDiv.style.height = "400px";

  if(createdGraph != null){
    createdGraph.destroy();
  }

  const ctx = document.getElementById('mainChart');

  var createdChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: gaps,
      datasets: [
        {
          label: 'Collected Data',
          data: percentages,
          borderColor: '#36A2EB',
          backgroundColor: '#9BD0F5',
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Parameter Inference'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Gap Times (ms)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Packets Received Together (%)'
          }
        }
      },
      interaction: {
      mode: 'index',
      intersect: false
    },
    }
  });

  return createdChart;
}

//Below global variables are used to keep track of sends
//These are the ms gaps btwn 2 packets we will be using
var gaps = [5, 6, 7, 8, 9, 10];

//Gaps distribution stores a send gap, and a map of its received distribution times
//E.g {5: {0.25: 1, 0.50: 4, 5.00: 3}, 6: {0.25: 0, 1.25: 4}, ... }
var gapsDistribution = new Map();

//Gaps count stores a send gap, and an array representing [# of received packets <= 1ms, # > 1ms]
//E.g {5: [5, 3], 6: [0, 4]}
var gaps1msCount = new Map();

//Used to keep track of how many messages we receive so when we get them all we can display summary data.\
var numReceivedMessages = 0

//Number of sends to test each gap time, i.e send 30 packet pairs with each pair being gapped by 5ms
const NUMSENDS = 5;

//Create the graph object outside so that we can check in the future if the graph needs to be reset
var createdGraph = null;

//By putting this outside of a function, when extension is opened via popup, we establish connection first
try {
  var connectionEstablished = false;
  var server = await connect();

  document.getElementById("sendRequest").addEventListener("click", sendMultiRMultiGap);

  //This fires when we get a message back from the server
  server.onmessage = (event) => {

    //Server sends a message in this form: "sendingGap receivingGap"
    //Sending gap being the gap we sent the pair of packets with
    //Receiving gap being the actual observed gap on the receiver side

    var splitData = event.data.split(" ");
    var sendGap = Number(splitData[0]);
    var receivedGap = Number(splitData[1]);

    addDistributionData(sendGap, receivedGap);
    addCountData(sendGap, receivedGap);

    numReceivedMessages += 1;
    //This detects after we have received all our responses from our server
    if (numReceivedMessages == NUMSENDS * gaps.length){
      var percentages = reportGaps();
      createdGraph = generateChart(percentages);
    }

    //Debugging, lets you see the contents of our 2 maps
    for (let [key, value] of gapsDistribution) {
      console.log(`For send gap ${key}`)
      for (let [k2, v2] of value) {
        console.log(k2, v2);
      }
    }

    for (let [k, v] of gaps1msCount) {
      console.log(`Counts ${k} is ${v}`);
    }

  }
  
} catch(error) {
  document.getElementById("errorMessage").innerHTML = "Can't establish connection"
  console.log(error)
}
