var epHttp = (function () {
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
    var url = parameters.url;
    var rewriter = sessionStorage.getItem('rewriter');

    if (rewriter) {
      if (url.indexOf('searchType=image')!==-1) {
        console.log('EP-HTTP:rewriting image url');
        url = url.replace(/https:\/\/www.googleapis.com\//, rewriter);
      } else {
      // TODO article?
        console.log('EP-HTTP:not image url:', url);
      }
    }

    var request = {
      id: handlerId,
      url: url
    };

    handlers[handlerId] = function (id, response) {
      parameters.cb(response);
      delete handlers[id];
      handlers[id] = null;
    };

    handlerId++;

    obj.worker.postMessage(request);
  };

  return obj;
})();
