(function () {
  var nlp_worker = null;
  var nlp_port = null;

  var workerMessage = function (type, data) {
    return JSON.stringify({ type: type, data: data }, null, 4);
  };

  //Create a web worker for NLP tasks
  function createWorker() {
    nlp_worker = new Worker("worker/nlp_worker.js");

    //TODO: Error handling & fallback.
    nlp_worker.onmessage = function (event) {
      var message = JSON.parse(event.data);
      switch (message.type) {
        case "keywordlist":
          if (nlp_port) {
            var message = {
              component: 'nlp',
              message: message
            };

            console.log('EP-NLP:posting message: ', message);
            nlp_port.postMessage(message);
          } else {
            console.log("EP-NLP:got keywords before port was initialized!");
          }
          break;
        default:
          console.warn("EP-NLP:Unable to recognize response " + message.type);
          break;
      }
    };
  };

  chrome.runtime.onConnectExternal.addListener(function (newPort) {
    console.log('EP-NLP:connecting: newPort:', newPort);
    if (newPort.name === 'nlp') {
      nlp_port = newPort;

      newPort.onMessage.addListener(function (event) {
        console.log('EP-NLP:message from CP:', event);
        if (event.component === 'nlp') {
          if (nlp_worker === null) {
            createWorker();
          }

          nlp_worker.postMessage(workerMessage(event.message.type,
                                               event.message.data));
        }
      });
    }
  });
})();
