/*
 * Natural Language Processing Library for JavaScript
 *
 * A client-side NLP utility library for web applications
 *
 * Copyright 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *   Plamena Manolova <plamena.manolova@intel.com>
 */


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
