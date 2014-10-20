(function(){
  var loaded = false;
  var open = true;

  eventPageMessage = function (type, data) {
    return {
      type: type,
      data: data
    };
  };

  chrome.runtime.onMessage.addListener( function(message,sender,sendResponse) {
    //console.log("CS: received message",message);
    if (loaded && message.message === "toggle" ) {
      //console.log("CS:toggling");
      document.querySelector('cp-main').setAttribute("toggle", open);
      open = !open;
    }
  });

  var port = chrome.runtime.connect({name: "ContentPushChannel"});

  port.onMessage.addListener(function (message) {
    switch(message.message) {
      case "keywordlist":
        var event = new CustomEvent("keywordlist", {
                      detail: message.data,
                      bubbles: true,
                      cancelable: true
                    });

        document.dispatchEvent(event);
        break;
      default:
        console.log("Unknown message from event page");
    }
  });

  //Do this immediately when script is injected
  rehostPage();

  function rehostPage() {
    // create and open panel
    var currentTabUrl=document.URL;
    var extensionUrl=chrome.extension.getURL("");
    var cpUrl=chrome.extension.getURL("content-push/cp-main.html");
    var cssUrl=chrome.extension.getURL("styles/main.css");

    // remove document content and add new head and body
    document.removeChild(document.documentElement);
    var html = document.createElement('html');
    var head = document.createElement('head');
    var body = document.createElement('body');

    var base = document.createElement('base');
    base.setAttribute('href',extensionUrl);
    head.appendChild(base);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    head.appendChild(link);

    link = document.createElement('link');
    link.rel = 'import';
    link.href = cpUrl;
    head.appendChild(link);

    var cp = document.createElement('cp-main');
    cp.setAttribute("iframeurl", currentTabUrl);
    cp.addEventListener('lineadd', function (e) {
      port.postMessage(eventPageMessage('lineadd', e.detail));
    });

    cp.addEventListener('resetextractor', function (e) {
      port.postMessage(eventPageMessage('resetextractor', e.detail));
    });

    cp.addEventListener('getkeywords', function (e) {
      port.postMessage(eventPageMessage('getkeywords', e.detail));
    });

    body.appendChild(cp);

    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    //send results back to event page
    //console.log("CS: sending done response");
    loaded = true;
  }
})();
