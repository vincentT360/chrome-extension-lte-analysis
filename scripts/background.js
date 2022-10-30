chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // console.log(JSON.stringify(details));
    console.log(details.requestId + " : " + details.method + " : " + details.url);
  },
  {urls: ["<all_urls>"]},
  ["requestBody"]
);
