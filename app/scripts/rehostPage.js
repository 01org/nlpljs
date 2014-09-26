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
      console.log("CS:toggling");
      document.querySelector('content-push').setAttribute("toggle", open);
      open = !open;
    }
    /*else if (loaded && message.message === "Got keywords") {
      var event = new CustomEvent("Got keywords", {
        detail: message.data,
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(event);
    }*/
  });

  var port = chrome.runtime.connect({name: "ContentPushChannel"});

  port.onMessage.addListener(function (message) {
    console.log(message);
  });

  /* Do this immediately when script is injected */
  rehostPage();

  function rehostPage() {
    // create and open panel
    var currentTabUrl=document.URL;
    var extensionUrl=chrome.extension.getURL("");
    var indexUrl=chrome.extension.getURL("index.html");

    // remove document content and add new head and body
    document.removeChild(document.documentElement);
    var html = document.createElement('html');
    var head = document.createElement('head');
    var body = document.createElement('body');
    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);

    /*Add new link/import element to head
      to load the index.html content */
    var link = document.createElement('link');
    link.rel = 'import';
    link.href = indexUrl;
    link.onload = function(e) {
      // copy head and body from import into main document
      var link = document.querySelector('link[rel="import"]');
      var content = link.import;

      // Grab DOM from warning.html's document.
      var head = content.querySelector('head');
      var body = content.querySelector('body');

      document.head.innerHTML=
        '<base href="'+extensionUrl+'">\n'+
        head.innerHTML;
      document.body.innerHTML=body.innerHTML;

      // set iframe url in <content-push> element
      var cp = document.querySelector('content-push');
      cp.setAttribute("iframeurl", currentTabUrl);

      cp.addEventListener('lineadd', function (e) {
        port.postMessage(eventPageMessage('lineadd', e.detail));
      });

      cp.addEventListener('resetextractor', function (e) {
        port.postMessage(eventPageMessage('resetextractor', e.detail));
      });
    };

    link.onerror = function(e) { console.log("got link error"); };
    document.head.appendChild(link);

    // send results back to event page
    //console.log("CS: sending done response");
    loaded = true;
  }
})();
