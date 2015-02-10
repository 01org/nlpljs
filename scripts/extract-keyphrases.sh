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

// from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle (array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

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
    shuffle(results);
  } else {
    results.sort();
  }

  console.log(results.join('\n'));
});
