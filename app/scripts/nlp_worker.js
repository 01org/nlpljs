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

var createLine = function (lineId, fromChar, toChar) {
  return {
    id: lineId,
    fromChar: fromChar,
    toChar: toChar
  };
};

var currentContext = null;

var createContext = function () {
  return{
    lines: [],
    lineIds: [],
    graph: null,
    keywords: null,
    ranges: null,
    text: '',
    findLine: function (charIndex) {
      var lineIndex = Math.floor((this.lines.length - 1) / 2);
      var left = 0;
      var right = this.lines.length - 1;
      var found = false;

      while (!found) {
        var line = this.lines[lineIndex];

        if (charIndex >= line.fromChar &&
            charIndex < line.toChar) {
          found = true;
        } else {
          if (charIndex < line.fromChar) {
            right = lineIndex;
            lineIndex = left + Math.floor((lineIndex - left) / 2);
          } else {
            left = lineIndex;
            lineIndex = right - Math.floor((right - lineIndex) / 2);
          }
        }
      }

      return line;
    }
  };
};

var eventPageMessage = function (type, data) {
  return JSON.stringify({ type: type, data: data }, null, 4);
};

/**
 * Prefix characters that are special to RegExp() with a backslash
 *     to render them inert.
 * @param {string} str The string to escape RexExp() special characters in.
 * @return {string} The string with escaped special characters.
 */
function escapeRegExp(str) {
  // the first parameter is a list of characters that are special to RegExp()
  // $& is the string matched in the first parameter
  // \\ is a single backslash to escape the character
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

this.onmessage = function (event) {
  var message = JSON.parse(event.data);

  if (loaded === false && message.type !== 'initialize') {
    queuedMessages[queuedMessages.length] = event;
    return;
  }

  switch (message.type) {
    case "initialize":
      require(['libnlp'], function (result) {
        libnlp = result;
	      if (libnlp)
          loaded = true;

	      if (loaded) {
          while (queuedMessages.length > 0)
            this.onmessage(queuedMessages.unshift());

          console.log('Loaded libnlp module');
	      } else {
	        postMessage(eventPageMessage("initerror", "error loading nlp modules"));
          console.log('error loading libnlp module');
	      }
      });
      break;
    case "newcontext":
      currentContext = createContext();
      break;
    case "lineadded":
      var prevLineId = message.data.prevLineId;
      var prevLineIndex = currentContext.lineIds.indexOf(prevLineId);
      var newLine;
      var startChar;

      var re = new RegExp(String.fromCharCode(160), "g");
      var text = message.data.text.replace(re,' ');

      if (prevLineIndex !== -1) {
        newLine = createLine(message.data.lineId,
          currentContext.lines[prevLineIndex].toChar,
          currentContext.lines[prevLineIndex].toChar + text.length);
        startChar = currentContext.lines[prevLineIndex].toChar;
      } else {
        newLine = createLine(message.data.lineId, 0, text.length);
        startChar = 0;
      }

      currentContext.lines.splice(prevLineIndex + 1, 0, newLine);
      currentContext.lineIds.splice(prevLineIndex + 1, 0, newLine.id);

      for (var i = prevLineIndex + 2; i < currentContext.lines.length; i++) {
        currentContext.lines[i].fromChar += text.length;
        currentContext.lines[i].toChar += text.length;
      }

      currentContext.text = [currentContext.text.slice(0, startChar), text,
        currentContext.text.slice(startChar)].join('');

      break;
    case "processcontext":
      var textForExtractor = currentContext.text.replace(/\[\w+\]/g, '');

      var keywords = [];
      var ranges = [];
      var result = libnlp.keyphrase_extractor.extractFrom(textForExtractor);

      for (var i = 0; i < result.keywords.length; i++) {
        var keyword = result.keywords[i];
        var index = keywords.length;
        var regex = new RegExp(escapeRegExp(keyword), "gi");

        keywords[index] = {
          text: keyword,
          groupId: index,
          score: result.scores[i]
        };

        while ((search = regex.exec(currentContext.text))) {
          var startChar = search.index;
          var endChar = startChar + keyword.length - 1;
          var startLine = currentContext.findLine(startChar);
          var endLine = currentContext.findLine(endChar);

          ranges[ranges.length] = {
            groupId: keywords[index].groupId,
            start: {
              lineId: startLine.id,
              charNo: startChar - startLine.fromChar
            },
            end: {
              lineId: endLine.id,
              charNo: endChar - endLine.fromChar
            }
          };
        }
      }

      currentContext.keywords = keywords;
      currentContext.ranges = ranges;

      break;
    case "getkeywords":
      postMessage(eventPageMessage("keywordlist", {
        keywords: currentContext.keywords,
        ranges: currentContext.ranges
      }));
      break;
    default:
      console.warn("nlp_worker: " + message.type + " is not recognized");
      break;
  }
};
