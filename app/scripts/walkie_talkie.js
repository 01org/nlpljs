this.importScripts("../bower_components/requirejs/require.js");

require.config({
  baseUrl: "./nlplib/"
});

var nlplib;
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
    case "Initialize nlplib":
      var request = new XMLHttpRequest();

      request.open("GET", message.data, false);
      request.send(null);

      require(['nlplib'], function (result) {
        nlplib = result;
        nlplib.postagger.fromJSON(request.responseText);
        postMessage(eventPageMessage("Loaded nlplib"));
        console.log('Loaded nlplib');
        loaded = true;
      });
      break;
    case "Add line":
      if (typeof nlplib === 'undefined' || loaded === false)
        queuedMessages[queuedMessages.length] = event;
      else {
        if (typeof pages[message.data.pageId] === 'undefined') {
          pages[message.data.pageId] = createPage(message.data.pageID);
          pages[message.data.pageId].graph =
            nlplib.keyphrase_extractor.getGraph();
        }

        pages[message.data.pageId].lines[pages[message.data.pageId].lines.length] =
          createLine(message.data.lineID, message.data.text);

        nlplib.keyphrase_extractor.setGraph(pages[message.data.pageId].graph);
        nlplib.keyphrase_extractor.addText(message.data.text);
      }

      break;
    case "Get keywords":
      if (typeof nlplib === 'undefined' || loaded === false)
        queuedMessages[queuedMessages.length] = event;
      else {
        var result = nlplib.keyphrase_extractor.score();
        postMessage(eventPageMessage("Got keywords", result));
      }

      break;
    case "Reset extractor":
      if (typeof nlplib === 'undefined' || loaded === false)
        queuedMessages[queuedMessages.length] = event;
      else
        nlplib.keyphrase_extractor.reset();
      console.log('reset');
      break;
    default:
      console.warn("walkie_talkie: " + message.type + " is not recognized");
      break;
  }
}