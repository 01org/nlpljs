#!/usr/bin/env node
// extract keywords from a piece of text on the command line;
// echo or cat something into this script to see the results, e.g.
// echo "the blue sun hates all interfering mind parasites" | ./extract.sh
// or to hide scores:
// echo "hello Ghandi, fancy a sandwich?" | ./extract.sh hide
var path = require('path');
var libnlp = require(path.join(__dirname, '../src/libnlp'));

var input = '';

var hideScores = !!process.argv[2];

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  var out = libnlp.keyphrase_extractor.extractFrom(input);
  console.log('KEYWORD, SCORE, ORDER');

  var results = [];

  var str;
  for (var i = 0; i < out.keywords.length; i++) {
    str = out.keywords[i];

    if (!hideScores) {
      str += ', ' + out.scores[i] + ', ' + i;
    }

    results.push(str);
  }

  // randomly sort results if scores are hidden
  if (hideScores) {
    var knuth_shuffle = require('knuth-shuffle');
    knuth_shuffle.knuthShuffle(results);
  } else {
    results.sort();
  }

  console.log(results.join('\n'));
});
