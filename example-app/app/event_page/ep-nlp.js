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

(function () {
  'use strict';

  var nlp_worker = null;
  var active_nlp_ports = {};

  var workerMessage = function (type, data, tabId) {
    return JSON.stringify({ type: type, data: data, tabId: tabId }, null, 4);
  };

  //Create a web worker for NLP tasks
  function createWorker() {
    nlp_worker = new Worker('worker/nlp_worker.js');

    //TODO: Error handling & fallback.
    nlp_worker.onmessage = function (event) {
      var message = JSON.parse(event.data);
      switch (message.type) {
        case 'keywordlist':
          var nlp_port = active_nlp_ports[message.data.tabId];

          if (nlp_port) {
            var reply = {
              component: 'nlp',
              message: message
            };

            console.log('EP-NLP:posting message: ', reply);
            nlp_port.postMessage(reply);
          } else {
            console.log('EP-NLP:got keywords before port was initialized!');
          }
          break;
        default:
          console.warn('EP-NLP:Unable to recognize response ' + message.type);
          break;
      }
    };
  }

  chrome.runtime.onConnectExternal.addListener(function (newPort) {
    console.log('EP-NLP:connecting: newPort:', newPort);
    if (newPort.name === 'nlp') {
      active_nlp_ports[newPort.sender.tab.id] = newPort;

      newPort.onMessage.addListener(function (event) {
        console.log('EP-NLP:message from CP:', event);
        if (event.component === 'nlp') {
          if (event.message.type === 'create') {
            if (nlp_worker === null) {
              createWorker();
            } else {
              console.log('EP-NLP:trying to start a new worker before closing the old one!');
            }
          }

          if (nlp_worker !== null) {
            nlp_worker.postMessage(workerMessage(event.message.type,
                                                 event.message.data,
                                                 newPort.sender.tab.id));

            if (event.message.type === 'close') {
              nlp_worker = null;
            }
          } else {
            console.log ('EP-NLP:trying to send messages to the worker before creating it!');
          }
        }
      });

      newPort.onDisconnect.addListener(function () {
        delete active_nlp_ports[newPort.sender.tab.id];
      });
    }
  });

  chrome.runtime.onSuspend.addListener(function() {
    console.log('EP-NLP: The event page is suspenended.');
  });
})();
