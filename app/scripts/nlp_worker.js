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
  baseUrl: "../libnlp/",
  paths: {
    text: "../bower_components/text/text"
  }
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

var createPage = function (pageId) {
  return{
    lines: [],
    pageId: pageId,
    graph: null
  };
};

var eventPageMessage = function (type, data) {
  return JSON.stringify({ type: type, data: data }, null, 4);
};

this.onmessage = function (event) {
  var message = JSON.parse(event.data);

  switch (message.type) {
    case "initialize":
      require(['libnlp'], function (result) {
        libnlp = result;
	      if (libnlp)
          loaded = true;

	      if (loaded) {
          while (queuedMessages.length > 0)
            this.onmessage(queuedMessages.unshift());

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
        pages[message.data.pageId] = createPage(message.data.pageId);
        pages[message.data.pageId].graph =
              libnlp.keyphrase_extractor.getGraph();
      }

      var re = new RegExp(String.fromCharCode(160), "gi");
      var text = message.data.text.replace(re,' ');
      text = text.replace(/\[\w*\]/g, '');

      pages[message.data.pageId].lines[pages[message.data.pageId].lines.length] =
      createLine(message.data.lineId, text);

      libnlp.keyphrase_extractor.setGraph(pages[message.data.pageId].graph);
      libnlp.keyphrase_extractor.addText(text);

      break;
    case "getkeywords":
      if (loaded === false) {
        queuedMessages[queuedMessages.length] = event;
        break;
      }

      libnlp.keyphrase_extractor.setGraph(pages[message.data.pageId].graph);
      var result = libnlp.keyphrase_extractor.score();
      var keywords = {};

      for (i = 0; i < pages[message.data.pageId].lines.length; i++) {
        var lineId = pages[message.data.pageId].lines[i].lineId;
        var lineText = pages[message.data.pageId].lines[i].text;

        for (j = 0; j < result.keyphrases.length; j++) {
          var keyphrase = result.keyphrases[j];

            if (typeof keywords[keyphrase] === 'undefined')
              keywords[keyphrase] = { text: keyphrase, occurrences: [] };

            var regex = new RegExp(keyphrase, "gi");
            while ((search = regex.exec(lineText))) {
              var numOccur = keywords[keyphrase].occurrences.length;
              keywords[keyphrase].occurrences[numOccur] = {
                pageId: pages[message.data.pageId].pageId,
                lineId: lineId,
                charIndex: search.index
              };
            }
        }

        for (j = 0; j < result.keywords.length; j++) {
          var keyword = result.keywords[j];

          if (typeof keywords[keyword] === 'undefined')
            keywords[keyword] = { text: keyword, occurrences: [] };

          var regex = new RegExp(keyword, "gi");
          while ((search = regex.exec(lineText))) {
            var numOccur = keywords[keyword].occurrences.length;
              keywords[keyword].occurrences[numOccur] = {
                pageId: pages[message.data.pageId].pageId,
                lineId: lineId,
                charIndex: search.index
              };
            }
          }
        }

      postMessage(eventPageMessage("keywordlist", keywords));
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
