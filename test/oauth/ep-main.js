/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

// Listens for the app launching then creates the window
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined,function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlEquals: 'http://localhost:8000/index.html'
            }
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    for (var i=0;i<tabs.length;i++) {
      var tab=tabs[i];
      if (tab.url.indexOf('http://localhost:8000/index.html') !== -1) {
        chrome.tabs.executeScript(tab.id, {file: "rehostPage.js"}, function(result) {
          if (chrome.runtime.lastError) {
            console.log('EP-MAIN:error executing content script:',chrome.runtime.lastError.message);
          }
        });
      }
    }
  });
});
