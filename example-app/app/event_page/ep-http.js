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
