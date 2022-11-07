// chrome.webRequest.onBeforeRequest.addListener(
//   function(details) {
//     console.log("onBeforeRequest: " + details.timeStamp + " : " + details.requestId + " : " + details.method + " : " + details.url);
//   },
//   {urls: ["<all_urls>"]}
// );

chrome.webRequest.onSendHeaders.addListener(
  function(details) {
    console.log("onSendHeaders: " + details.timeStamp + " : " + details.requestId + " : " + details.method + " : " + details.url);
  },
  {urls: ["<all_urls>"]}
)