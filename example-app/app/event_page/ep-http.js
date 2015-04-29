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
  var obj = {};
  var handlerId = 1;
  var handlers = {};

  obj.worker = new Worker('../worker/http_worker.js');

  /* event.data should be an object like
     {id: <handler ID>, response: <http response>} */
  obj.worker.onmessage = function (event) {
    var handlerId = event.data.id;
    var handler = handlers[handlerId];
    var response = event.data.response;
    handler(handlerId, response);
  };

  /**
   * message sent to content script:
   * {
   *   component: 'http',
   *   url: 'http://url.to.get',
   *   cb: <function which receives the response>
   * }
   *
   * Then passed to this function:
   *
   * parameters.url URL to GET
   * parameters.cb Callback which will receive the response
   */
  obj.send = function (parameters) {
    var request = {
      id: handlerId,
      url: parameters.url
    };

    handlers[handlerId] = function (id, response) {
      console.log('EP-HTTP:message from http_worker:', id, response);
      parameters.cb(response);
      delete handlers[id];
      handlers[id] = null;
    };

    handlerId++;

    console.log('EP-HTTP:send message to http_worker:', request);
    obj.worker.postMessage(request);
  };

  chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    var keepChannelOpen = false;

    if (message.component === 'http') {
      console.log('EP-HTTP:got message:', message);
      keepChannelOpen = true;

      obj.send({
        url: message.url,
        cb: sendResponse
      });
    }

    return keepChannelOpen; // to call sendResponse asynchronously
  });
})();
