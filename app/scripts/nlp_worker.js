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
    text: "../bower_components/requirejs-text/text"
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
    id: pageId,
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

      var re = new RegExp(String.fromCharCode(160), "g");
      var text = message.data.text.replace(re,' ');

      pages[message.data.pageId].lines[pages[message.data.pageId].lines.length] =
      createLine(message.data.lineId, text);

      text = text.replace(/\[\w+\]/g, '');

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
      var keywords = [];
      var ranges = [];

      function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }

      for (i = 0; i < result.keyphrases.length; i++) {
        var keyphrase = result.keyphrases[i];
        var index = keywords.length;

        keywords[index] = {
          text: keyphrase,
          groupId: index
        };

        for (j = 0; j < pages[message.data.pageId].lines.length; j++) {
          var lineId = pages[message.data.pageId].lines[j].id;
          var prevLineId;
          var lineText = pages[message.data.pageId].lines[j].text;
          var totalText = lineText;
          var lineStart = 0;

          if (j > 0) {
            prevLineId = pages[message.data.pageId].lines[j - 1].id;
            totalText = pages[message.data.pageId].lines[j - 1].text + lineText;
            lineStart = pages[message.data.pageId].lines[j - 1].text.length;
          }

          var regex = new RegExp(escapeRegExp(keyphrase), "gi");
          while ((search = regex.exec(totalText))) {
            var startLine = lineId;
            var endLine = lineId;
            var startChar = search.index - lineStart;
            var endChar = 0;

            if (search.index < lineStart) {
              if (search.index + keyphrase.length - 1 < lineStart)
                continue;
              else {
                startChar = search.index;
                startLine = prevLineId;
              }
            }

            endChar = (search.index - lineStart) + keyphrase.length - 1;
            ranges[ranges.length] = {
              groupId: keywords[index].groupId,
              start: {
                lineNo: startLine,
                charNo: startChar
              },
              end: {
                lineNo: endLine,
                charNo: endChar
              }
            };
          }
        }
      }

      for (i = 0; i < result.keywords.length; i++) {
        var keyword = result.keywords[i];
        var index = keywords.length;

        keywords[index] = {
          text: keyword,
          groupId: index
        };

        for (j = 0; j < pages[message.data.pageId].lines.length; j++) {
          var lineId = pages[message.data.pageId].lines[j].id;
          var lineText = pages[message.data.pageId].lines[j].text;

          var regex = new RegExp(escapeRegExp(keyword), "gi");
          while ((search = regex.exec(lineText))) {
            ranges[ranges.length] = {
              groupId: keywords[index].groupId,
              start: {
                lineNo: lineId,
                charNo: search.index
              },
              end: {
                lineNo: lineId,
                charNo: search.index + (keyword.length - 1)
              }
            };
          }
        }
      }

      postMessage(eventPageMessage("keywordlist", { keywords: keywords,
        ranges: ranges }));

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
