'use strict';
/* read the design doc for explanation of the comments */

/**
 * message routing
 *  component: ('auth'||...)
 */

chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
  if (message === "cp-init" ) {
    chrome.pageAction.show(sender.tab.id);
  }
});

chrome.runtime.onMessageExternal.addListener(function(message,sender,sendResponse) {
  var keepChannelOpen=false;

  if (message.component === 'auth') {
    console.log('EP-AUTH:got message:',message);
    var service = message.service;

    if (epAuth.hasOwnProperty(service)) {
      var type = message.type;
      switch (type) {
        case 'gettoken':
          keepChannelOpen = epAuth[service].getToken(sendResponse);
          break;
        case 'removecachedtoken':
          var token = message.token;
          epAuth[service].removeCachedToken(token);
          break;
        default:
          console.log(new Error('EP-AUTH:unknown message type:'+type));
          break;
      }
    } else {
      console.log(new Error('EP-AUTH:unknown service:'+service));
    }
  } else if (message.component === 'http') {
    keepChannelOpen = true;

    epHttp.send({
      url: message.url,
      cb: sendResponse
    });
  }

  return keepChannelOpen; // to call sendResponse asynchronously
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  console.log('tab ' + tabId + ' is removed');
  /*Could be possible to unload the worker if no tabs are using it ? */
});

if (chrome.pageAction) {
  chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, "cp-toggle");
  });
}
