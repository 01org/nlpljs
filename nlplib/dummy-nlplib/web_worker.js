this.importScripts("./node_modules/requirejs/require.js");

var result;

var nlplib = require(['nlplib'], function (nlplib) {
    result = nlplib.keyword_extractor.extractFrom("Hello world!");
    postMessage(result.keywords);
});

this.onmessage = function(event) {
  postMessage("Reply from web worker");
}