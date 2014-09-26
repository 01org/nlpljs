/*
 * This file is a webworker (https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).
 * It acts as an interface between the content script (event_page.js) and NLP modules.
 * The content script initialized the worker with var worker =  new Worker(file);
 * It sends messages to the worker using worker.postMessage() and listens to messages by worker.onmessage() listener.
 * The web worker processes the following messages:
 * initialize: Initialize the NLP modules. Respone is 'initdone' or 'initerror'
 * lineadd: Adds a line to current page (creates a new page if there is none).
 * getkeywords: Gets keywords from the current page. response is 'keywordlist'(list of keywords).
 * resetextractor: Resets the extractor module.
 *
*/

this.importScripts("../bower_components/requirejs/require.js");

require.config({
  baseUrl: "../libnlp/"
});

var libnlp;
var queuedMessages = [];
var loaded = false;

var createLine = function (lineId, lineText) {
  return {
    id: lineId,
    text: lineText
  };
};

var pages = [];

var createPage = function (pageID) {
  return{
    lines: [],
    pageID: pageID,
    graph: null
  };
};

var eventPageMessage = function (type, data) {
  return JSON.stringify({ type: type, data: data }, null, 4);
};

this.onmessage = function (event) {
  var message = JSON.parse(event.data);

  while (queuedMessages.length > 0)
    this.onmessage(queuedMessages.unshift());

  switch (message.type) {
    case "initialize":
      var request = new XMLHttpRequest();
      /*
       * TODO: Syncronously loading a large file and then
       * passing it over as a string might be a bad idea.
       * load the file in NLP module itself perhaps?
       */
      request.open("GET", message.data, false);
      request.send(null);

      require(['libnlp'], function (result) {
        libnlp = result;
	      if (libnlp) {
          libnlp.postagger.fromJSON(request.responseText);
          loaded = true;
    	  }

	      if (loaded) {
          postMessage(eventPageMessage("initdone", "initialized nlp modules"));
          console.log('Loaded libnlp module');
	      } else {
	        postMessage(eventPageMessage("initerror", "error loading nlp modules"));
          console.log('error loading libnlp module');
	      }
      });
      break;
    case "lineadd":
      if (loaded === false) {
        queuedMessages[queuedMessages.length] = event;
        break;
      }
      
      if (typeof pages[message.data.pageId] === 'undefined') {
        pages[message.data.pageId] = createPage(message.data.pageID);
        pages[message.data.pageId].graph =
        libnlp.keyphrase_extractor.getGraph();
      }

      pages[message.data.pageId].lines[pages[message.data.pageId].lines.length] =
        createLine(message.data.lineID, message.data.text);

      libnlp.keyphrase_extractor.setGraph(pages[message.data.pageId].graph);
      libnlp.keyphrase_extractor.addText(message.data.text);

      break;
    case "getkeywords":
      if (loaded === false) {
        queuedMessages[queuedMessages.length] = event;
        break;
      }
      
      var result = libnlp.keyphrase_extractor.score();
      postMessage(eventPageMessage("keywordlist", result));
      break;
    case "resetextractor":
      if (loaded === false) {
        queuedMessages[queuedMessages.length] = event;
        break;
      }

      libnlp.keyphrase_extractor.reset();
      break;
    default:
      console.warn("nlp_worker: " + message.type + " is not recognized");
      break;
  }
};