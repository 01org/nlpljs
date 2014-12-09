'use strict';

chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
  if (message === "cp-init" ) {
    chrome.pageAction.show(sender.tab.id);
  }
});

if (chrome.pageAction) {
  chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, "cp-toggle");
  });
}
