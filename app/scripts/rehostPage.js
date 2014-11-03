(function(){
/* read the design doc for explaination on the comments */

  var open = true;
  var port = null;

  function eventPageMessage(type, data) {
    return {
      type: type,
      data: data
    };
  }

  chrome.runtime.onMessage.addListener( function(message,sender,sendResponse) {
    if (message === "cp-toggle") {
      document.querySelector('cp-main').setAttribute("toggle", open);
      open = !open;
    }
  });

  chrome.runtime.sendMessage("cp-nlpinit");

  port = chrome.runtime.connect();
  port.onMessage.addListener(function(message) {
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

  rehostPage();

  function rehostPage() {
    // create and open panel
    var currentTabUrl=document.URL;
    var extensionUrl=chrome.extension.getURL("");
    var cpMainUrl=chrome.extension.getURL("content-push/cp-main.html");
    var cpGlobalsUrl=chrome.extension.getURL("content-push/cp-globals.html");
    var cssUrl=chrome.extension.getURL("styles/main.css");

    // remove document content and add new head and body
    document.removeChild(document.documentElement);
    var html = document.createElement('html');
    var head = document.createElement('head');
    var body = document.createElement('body');
    body.setAttribute('unresolved', '');

    var base = document.createElement('base');
    base.setAttribute('href',extensionUrl);
    head.appendChild(base);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    head.appendChild(link);

    link = document.createElement('link');
    link.rel = 'import';
    link.href = cpGlobalsUrl;
    head.appendChild(link);

    link = document.createElement('link');
    link.rel = 'import';
    link.href = cpMainUrl;
    head.appendChild(link);

    var cpGlobals = document.createElement('cp-globals');
    cpGlobals.setAttribute("app_id", chrome.runtime.id);
    cpGlobals.setAttribute("iframeurl", currentTabUrl);

    body.appendChild(cpGlobals);

    var cpMain = document.createElement('cp-main');
    cpMain.setAttribute('fit', '');
    cpMain.addEventListener('lineadded', function (e) {
      port.postMessage(eventPageMessage('lineadded', e.detail));
    });

    cpMain.addEventListener('newcontext', function (e) {
      port.postMessage(eventPageMessage('newcontext', e.detail));
    });

    cpMain.addEventListener('getkeywords', function (e) {
      port.postMessage(eventPageMessage('getkeywords', e.detail));
    });

    cpMain.addEventListener('processcontext', function (e) {
      port.postMessage(eventPageMessage('processcontext', e.detail));
    });

    body.appendChild(cpMain);

    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);
  }
})();
