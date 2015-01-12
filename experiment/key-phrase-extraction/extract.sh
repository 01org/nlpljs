#!/usr/bin/env node
// extract keywords from a piece of text on the command line;
// echo or cat something into this script to see the results, e.g.
// echo "the blue sun hates all interfering mind parasites" | ./extract.sh
var libnlp = require('../../app/libnlp/libnlp');

var input = '';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  var out = libnlp.keyphrase_extractor.extractFrom(input);
  console.log('KEYWORD: SCORE');
  for (var i = 0; i < out.keywords.length; i++) {
    console.log(out.keywords[i] + ': ' + out.scores[i]);
  }
});
