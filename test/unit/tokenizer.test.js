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

var chai = require('chai');
var expect = chai.expect;
chai.should();

var tokenizer = require('../../src/libnlp').tokenizer;

describe('tokenizer', function () {

  it('should tokenize a simple string of words with no punctuation', function () {
    var text = 'hello world what a nice day it is';
    var expected = ['hello', 'world', 'what', 'a', 'nice', 'day', 'it', 'is'];
    tokenizer.tokenize(text).should.eql(expected);
  });

  it('should tokenize a string which is just punctuation and spaces', function () {
    var text = ' . ';
    var expected = ['.'];
    var actual = tokenizer.tokenize(text);
    actual.should.eql(expected);
  });

  it('should tokenize a string with punctuation and extra spaces', function () {
    var text = '  Hello world, what a   nice   day   it is! Let\'s go for a walk .  ';
    var expected = ['Hello', 'world', ',', 'what', 'a', 'nice', 'day',
                    'it', 'is', '!', 'Let', '\'s', 'go', 'for', 'a',
                    'walk', '.'];

    var actual = tokenizer.tokenize(text);

    actual.should.eql(expected);
  });

  it('should handle special characters as tokens', function () {
    var text = '£100 is roughly $80. {if you are an American man@home}';
    var expected = ['£', '100', 'is', 'roughly', '$', '80', '.', '{',
                    'if', 'you', 'are', 'an', 'American', 'man', '@',
                    'home', '}'];
    var actual = tokenizer.tokenize(text);
    actual.should.eql(expected);
  });

});
