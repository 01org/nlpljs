'use strict';

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
    //console.log("BG:sending rehost message to CS");
    chrome.tabs.sendMessage(tabs[0].id, {message: "rehost"}, function(response) {
      //console.log("BG:received response",response);
    });
  });
});

chrome.tabs.executeScript(null, {file: "scripts/rehostPage.js"});
