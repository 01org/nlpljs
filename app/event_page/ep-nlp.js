(function () {
  var nlp_worker = null;
  var active_nlp_ports = {};

  var workerMessage = function (type, data, tabId) {
    return JSON.stringify({ type: type, data: data, tabId: tabId }, null, 4);
  };

  //Create a web worker for NLP tasks
  function createWorker() {
    nlp_worker = new Worker("worker/nlp_worker.js");

    //TODO: Error handling & fallback.
    nlp_worker.onmessage = function (event) {
      var message = JSON.parse(event.data);
      switch (message.type) {
        case "keywordlist":
          var nlp_port = active_nlp_ports[message.data.tabId];

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
      active_nlp_ports[newPort.sender.tab.id] = newPort;

      newPort.onMessage.addListener(function (event) {
        console.log('EP-NLP:message from CP:', event);
        if (event.component === 'nlp') {
          if (event.message.type === 'create') {
            if (nlp_worker === null) {
              createWorker();
            } else {
              console.log("EP-NLP:trying to start a new worker before closing the old one!");
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
            console.log ("EP-NLP:trying to send messages to the worker before creating it!");
          }
        }
      });

      newPort.onDisconnect.addListener(function () {
        delete active_nlp_ports[newPort.sender.tab.id];
      });
    }
  });

  chrome.runtime.onSuspend.addListener(function() {
    console.log("EP-NLP: The event page is suspenended.");
  });
})();
