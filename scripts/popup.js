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
    server.send("p " + gap);
    var time0 = performance.now();
    wait(gap);
    var time1 = performance.now();
    server.send("p " + gap);
    var timeDiff = time1-time0;
    console.log("Gap: " + timeDiff);
  }
  else{
    console.log("Could not send requests because the WebSocket connection failed");
  }
}

function sendLittleBigPair(){
  if(connectionEstablished){
    server.send("g 1 0");
    server.send("g 2 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
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
function sendPeriodicityPackets() {
  resetReceivedTracking();
  gaps.forEach(function (g) {
    for(let i = 0; i < NUMSENDS; i++) {
      sendWebSocket(g);
      wait(50);
    }
  })
}

//This function sends multiple pairs of one small packet coupled with a big packet (> 100B)
function sendGrantPackets() {
  for(let i = 0;i<SRMAX;i++){
    sendLittleBigPair();
    wait(50);
  }
}

function sendInferencePackets(){
  sendGrantPackets();
  sendPeriodicityPackets();
}

function determineX(percentages){
  //start at 5 ms gap and iterate until 25 looking for either 0 or lowest percentage
  var minIndex = 4;
  var minPercentage = 100.00;
  for(let i = 4; i<percentages.length; i++){
    if(percentages[i] < ZEROTHRESHOLD){
      return i+1
    }
    if(percentages[i] < minPercentage){
      minPercentage = percentages[i];
      minIndex = i;
    }
  }
  return minIndex+1;
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
var gaps = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

//Gaps distribution stores a send gap, and a map of its received distribution times
//E.g {5: {0.25: 1, 0.50: 4, 5.00: 3}, 6: {0.25: 0, 1.25: 4}, ... }
var gapsDistribution = new Map();

//Gaps count stores a send gap, and an array representing [# of received packets <= 1ms, # > 1ms]
//E.g {5: [5, 3], 6: [0, 4]}
var gaps1msCount = new Map();

//Used to keep track of how many messages we receive so when we get them all we can display summary data.\
var numReceivedMessages = 0

//Number of sends to test each gap time, i.e send 30 packet pairs with each pair being gapped by 5ms
const NUMSENDS = 30;

//Create the graph object outside so that we can check in the future if the graph needs to be reset
var createdGraph = null;

var srGaps = [];
var srResponseCount = 0;
var srBadResponseCount = 0;
const SRMAX = 100;
const SRMINOUTLIER = 1;
const SRMAXOUTLIER = 15;

var s_periodicities = [5, 10, 20];
var sr_grant;
const ZEROTHRESHOLD = 5.00;

//By putting this outside of a function, when extension is opened via popup, we establish connection first
try {
  var connectionEstablished = false;
  var server = await connect();

  // document.getElementById("periodicityInference").addEventListener("click", sendPeriodicityPackets);
  // document.getElementById("grantInference").addEventListener("click", sendGrantPackets);
  document.getElementById("startInference").addEventListener("click", sendInferencePackets);

  //This fires when we get a message back from the server
  server.onmessage = (event) => {
    console.log("received msg from server");

    //Server sends a message in this form: "sendingGap receivingGap"
    //Sending gap being the gap we sent the pair of packets with
    //Receiving gap being the actual observed gap on the receiver side

    var splitData = event.data.split(" ");
    var responseType = splitData[0]

    if(responseType == "g"){
      srResponseCount++;
      var t_2 = splitData[1];
      srGaps.push(Number(t_2));
      if(srResponseCount == SRMAX){
        var srTotal = 0;
        for(let i = 0;i<srResponseCount;i++){
          if(srGaps[i] < SRMINOUTLIER || srGaps[i] > SRMAXOUTLIER){
            srBadResponseCount++;
          }
          else{
            srTotal += srGaps[i];
          }
        }
        var avgSR = srTotal / (SRMAX-srBadResponseCount);
        document.getElementById("sr_grant").innerHTML = "T<sub>sr_grant</sub> = " + avgSR + " ms";
        // document.getElementById("bsr_grant").innerHTML = "T<sub>bsr_grant</sub> = " + avgSR;
        // document.getElementById("sr_processing_latency").innerHTML = "SR Processing Latency = " + (avgSR-4);
        // document.getElementById("sr_relationship").innerHTML = "T<sub>sr_grant</sub> = SR Processing Latency + 4 ms";
        document.getElementById("bad_sr_count").innerHTML = srBadResponseCount + " outlier packet pairs dropped";
        srGaps = [];
        srResponseCount = 0;
        srBadResponseCount = 0;
        sr_grant = avgSR;
      }
    }

    if(responseType == "p"){
      var sendGap = Number(splitData[1]);
      var receivedGap = Number(splitData[2]);

      addDistributionData(sendGap, receivedGap);
      addCountData(sendGap, receivedGap);

      numReceivedMessages += 1;

      //This detects after we have received all our responses from our server
      if (numReceivedMessages == NUMSENDS * gaps.length){
        var percentages = reportGaps();
        createdGraph = generateChart(percentages);
        var xValue = determineX(percentages);
        document.getElementById("min_x").innerHTML = xValue + " ms was chosen as the zero % point";
        var sr_periodicity = xValue - sr_grant;
        if(sr_periodicity < 0){
          document.getElementById("errorMessage").innerHTML = "sr_grant value is larger than minimum % received gap"
          console.log("sr_grant value is larger than minimum % received gap")
        }
        var roundedPeriodicity = s_periodicities.reduce(function(prev, curr) {
          return (Math.abs(curr - sr_periodicity) < Math.abs(prev - sr_periodicity) ? curr : prev);
        });
        document.getElementById("sr_periodicity").innerHTML = "T<sub>sr_periodicity</sub> = " + roundedPeriodicity + " ms";
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
  }
  
} catch(error) {
  document.getElementById("errorMessage").innerHTML = "Can't establish connection"
  console.log(error)
}
