(function () {
  var nlp_worker = null;

  var workerMessage = function (type, data) {
    return JSON.stringify({ type: type, data: data }, null, 4);
  };

  //Create a web worker for NLP tasks
  function createWorker(nlp_port) {
    nlp_worker = new Worker("worker/nlp_worker.js");

    //TODO: Error handling & fallback.
    nlp_worker.onmessage = function(event) {
      var message = JSON.parse(event.data);
      switch (message.type) {
        case "keywordlist":
          if (nlp_port) {
            var message = {
              component: 'nlp',
              message: message
            };

            nlp_port.postMessage(message);
          } else {
            console.log("got keywords before port was initialized!");
          }
          break;
        default:
          console.warn("nlp_worker:Unable to recognize response " + message.type);
          break;
      }
    };
  };

  chrome.runtime.onConnectExternal.addListener(function(newPort) {
    newPort.onMessage.addListener(function(event) {
      if (event.component === 'nlp') {
        if (nlp_worker === null)
          createWorker(newPort);

        nlp_worker.postMessage(workerMessage(event.message.type,
                                             event.message.data));
      }
    });
  });
})();