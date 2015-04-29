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

// compare our tokenizer against the de facto standard NLP library
// for JS (natural) and another smaller and simpler library (nlp_compromise)
var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var Benchmark = require('benchmark');

var nlpc = require('nlp_compromise');
var nlpn = require('natural');

var libnlp = require('../../src/libnlp');
var nlpn_tokenizer = new nlpn.WordTokenizer();

var textPath = path.join(__dirname, 'battle-of-hastings.txt');
var text = fs.readFileSync(textPath, 'utf8');

var suite = new Benchmark.Suite;

suite
.add('libnlp.tokenizer#tokenize', function () {
  libnlp.tokenizer.tokenize(text);
})
.add('nlp_compromise#tokenize', function () {
  nlpc.tokenize(text);
})
.add('natural.WordTokenizer#tokenize', function () {
  nlpn_tokenizer.tokenize(text);
})
.on('complete', function () {
  this.forEach(function (bench) {
    console.log(bench.name + ': ' + bench.times.elapsed + ' seconds');
  });
})
.run({async: true});
