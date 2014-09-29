'use strict';

var firstClick = true;
var nlplibReady = false;
var worker;
var localport;
var workerMessage = function (type, data) {
  return JSON.stringify({ type: type, data: data }, null, 4);
};

// Listens for the app launching then creates the window
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined,function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlContains: 'docs.google.com',
              pathContains: '/document/'
            }
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (firstClick) {
      firstClick = false;
      //estabilsing communication between event_page.js <--> nlp_worker.js
      createWorker();
      
      //estabilsing communication between event_page.js <--> rehost.js
      initChannel();

      //Execute the content script
      chrome.tabs.executeScript(null, {file: "scripts/rehostPage.js"});
    } else {
      chrome.tabs.sendMessage(tabs[0].id, {message: "toggle"});
    }
  });
});

//Create a web worker for NLP tasks
var createWorker = function() {
  var posModelPath = chrome.extension.getURL('libnlp/models/english.json');

  worker = new Worker("scripts/nlp_worker.js");

  //TODO: Error handling & fallback.
  worker.onmessage = function(event) {
    var message = JSON.parse(event.data);
    switch (message.type) {
      case "initdone":
        nlplibReady = true;
        break;
      case "keywordlist":
        localport.postMessage({message: message.type, data: message.data});
        break;
      default:
        console.warn("nlp_worker:Unable to recognize response " + message.type);
        break;
    }
  };
  
  //Initialize the NLP modules
  worker.postMessage(workerMessage("initialize", posModelPath));
};

var initChannel = function() {
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "ContentPushChannel")
      return;
    
    localport = port;
    /* This background page is the common link between the content script (rehost.js) and
      the web worker. Relay the messages comming from the content script to the web worker.*/
    port.onMessage.addListener(function (message) {
      //relay messages from rehost.js to nlp_worker.js
      worker.postMessage(workerMessage(message.type, message.data));
    });
  });
};
