/*
 * Natural Language Processing Library for JavaScript
 *
 * A client-side NLP utility library for web applications
 *
 * Copyright 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *   Plamena Manolova <plamena.manolova@intel.com>
 */

/* jshint worker:true */

/*
 * This file is a webworker (https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).
 * It acts as an interface between the event page (event_page/ep-main.js) and NLP modules.
 * The event page initializes the worker with var worker =  new Worker(file);
 * It sends messages to the worker using worker.postMessage() and listens to messages by worker.onmessage() listener.
 * The web worker processes the following messages:
 * initialize: Initialize the NLP modules. Respone is 'initdone' or 'initerror'
 * lineadd: Adds a line to current page (creates a new page if there is none).
 * getkeywords: Gets keywords from the current page. response is 'keywordlist'(list of keywords).
 * resetextractor: Resets the extractor module.
 *
*/

/* globals require:true */
this.importScripts('../bower_components/requirejs/require.js');

require.config({
  baseUrl: '../libnlp/',
  paths: {
    text: '../bower_components/requirejs-text/text'
  }
});

var libnlp;
var queuedMessages = [];
var loaded = false;

/* for tracking group IDs */
var groupIds = {};
var nextGroupId = 0;

var createLine = function (lineId, fromChar, toChar) {
  'use strict';

  return {
    id: lineId,
    fromChar: fromChar,
    toChar: toChar
  };
};

var currentContext = null;

var createContext = function (requestTabId) {
  'use strict';

  return {
    tabId: requestTabId,
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
      var line = '';

      while (!found) {
        line = this.lines[lineIndex];

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
  'use strict';

  return JSON.stringify({ type: type, data: data }, null, 4);
};

/**
 * Prefix characters that are special to RegExp() with a backslash
 *     to render them inert.
 * @param {string} str The string to escape RexExp() special characters in.
 * @return {string} The string with escaped special characters.
 */
function escapeRegExp(str) {
  'use strict';

  // the first parameter is a list of characters that are special to RegExp()
  // $& is the string matched in the first parameter
  // \\ is a single backslash to escape the character
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

var processMessage = function (message) {
  'use strict';

  switch (message.type) {
    case 'create':
      require(['libnlp'], function (result) {
        libnlp = result;
        if (libnlp) {
          loaded = true;
        }

        if (loaded) {
          while (queuedMessages.length > 0) {
            var prevMessage = queuedMessages.shift();
            processMessage(prevMessage);
          }

          console.log('Loaded libnlp module');
        } else {
          postMessage(eventPageMessage('initerror', 'error loading nlp modules'));
          console.log('error loading libnlp module');
        }
      });
      break;
    case 'newcontext':
      currentContext = createContext(message.tabId);
      break;
    case 'lineadded':
      if (currentContext.tabId !== message.tabId) {
        console.log('NLP-WORKER: Tab id mismatch!');
        break;
      }

      var prevLineId = message.data.prevLineId;
      var prevLineIndex = currentContext.lineIds.indexOf(prevLineId);
      var newLine;
      var startChar;

      var re = new RegExp(String.fromCharCode(160), 'g');
      var text = message.data.text.replace(re, ' ');

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
    case 'processcontext':
      if (currentContext.tabId !== message.tabId) {
        console.log('NLP-WORKER: Tab id mismatch!');
        break;
      }

      var textForExtractor = currentContext.text.replace(/\[\w+\]/g, '');

      var keywords = [];
      var ranges = [];
      var result = libnlp.keyphrase_extractor.extractFrom(textForExtractor);

      for (i = 0; i < result.keywords.length; i++) {
        var keyword = result.keywords[i];
        var regex = new RegExp(escapeRegExp(keyword), 'gi');

        /* if we've seen this keyword before, use the existing groupId */
        var groupId = groupIds[keyword];
        if (typeof groupId === 'undefined') {
          groupId = nextGroupId;
          groupIds[keyword] = groupId;
          nextGroupId++;
        }

        keywords.push({
          text: keyword,
          groupId: groupId,
          score: result.scores[i]
        });

        var search;
        while ((search = regex.exec(currentContext.text))) {
          startChar = search.index;
          var endChar = startChar + keyword.length - 1;
          var startLine = currentContext.findLine(startChar);
          var endLine = currentContext.findLine(endChar);

          ranges[ranges.length] = {
            groupId: groupId,
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
    case 'getkeywords':
      if (currentContext.tabId !== message.tabId) {
        console.log('NLP-WORKER: Tab id mismatch!');
        break;
      }

      postMessage(eventPageMessage('keywordlist', {
        keywords: currentContext.keywords,
        ranges: currentContext.ranges,
        tabId: currentContext.tabId
      }));
      break;
    case 'close':
      close();
      break;
    default:
      console.warn('nlp_worker: ' + message.type + ' is not recognized');
      break;
  }
};

this.onmessage = function (event) {
  'use strict';

  var message = JSON.parse(event.data);

  if (loaded === false && message.type !== 'create') {
    queuedMessages[queuedMessages.length] = message;
    return;
  }

  processMessage(message);
};
