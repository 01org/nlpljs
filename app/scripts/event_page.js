'use strict';

var firstClick = true;
var nlplibReady = false;
var walkieTalkie;
var walkieTalkieMessage = function (type, data) {
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
      var posModelPath =
        chrome.extension.getURL('scripts/nlplib/models/english.json');

      firstClick = false;
      chrome.tabs.executeScript(null, {file: "scripts/rehostPage.js"});

      walkieTalkie = new Worker("scripts/walkie_talkie.js");

      walkieTalkie.onmessage = function(event) {
        var message = JSON.parse(event.data);

        switch (message.type) {
          case "Loaded nlplib":
            nlplibReady = true;
            break;
          default:
            console.warn("event_page: You sent a message that the event page \
            doesn't recognize!");
            break;
        }
      }

      walkieTalkie.postMessage(walkieTalkieMessage("Initialize nlplib",
                                                   posModelPath));

      chrome.runtime.onConnect.addListener(function (port) {
        if (port.name !== "background/content script messages")
          return;

        port.onMessage.addListener(function (message) {
          walkieTalkie.postMessage(walkieTalkieMessage(message.type,
                                                       message.data));
        });
      });
    } else {
      chrome.tabs.sendMessage(tabs[0].id, {message: "toggle"});
    }
  });
});
