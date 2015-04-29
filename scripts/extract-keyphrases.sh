#!/usr/bin/env node

# Natural Language Processing Library for JavaScript
#
# A client-side NLP utility library for web applications
#
# Copyright 2015 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
#
# Authors:
#   Elliot Smith <elliot.smith@intel.com>
#   Max Waterman <max.waterman@intel.com>
#   Plamena Manolova <plamena.manolova@intel.com>

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
