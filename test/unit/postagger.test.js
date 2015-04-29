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

var postagger = require('../../src/libnlp').postagger;

describe('postagger', function () {

  it('should assign part of speech tags to a text', function () {
    var text = 'The Battle of Hastings was fought in 1066. It was ' +
               'part of the Norman Conquest of England.';

    var expected = [
      { token: 'The', tag: 'DT' },
      { token: 'Battle', tag: 'NNP' },
      { token: 'of', tag: 'IN' },
      { token: 'Hastings', tag: 'NNP' },
      { token: 'was', tag: 'VBD' },
      { token: 'fought', tag: 'VBN' },
      { token: 'in', tag: 'IN' },
      { token: '1066', tag: 'CD' },
      { token: '.', tag: 'SB' },
      { token: 'It', tag: 'PRP' },
      { token: 'was', tag: 'VBD' },
      { token: 'part', tag: 'NN' },
      { token: 'of', tag: 'IN' },
      { token: 'the', tag: 'DT' },
      { token: 'Norman', tag: 'NNP' },
      { token: 'Conquest', tag: 'NN' },
      { token: 'of', tag: 'IN' },
      { token: 'England', tag: 'NNP' },
      { token: '.', tag: 'SB' }
    ];

    var actual = postagger.tag(text);

    actual.should.eql(expected);
  });

  it('should be trainable using a corpus', function () {
    var corpus = [
      { observation: 'The', state: 'DT' },
      { observation: 'Battle', state: 'NNP' },
      { observation: 'of', state: 'IN' },
      { observation: 'Hastings', state: 'NNP' },
      { observation: '.', state: 'SB' }
    ];

    postagger.train([corpus]);

    var expected = [
      { token: 'The', tag: 'DT' },
      { token: 'Battle', tag: 'NNP' },
      { token: 'of', tag: 'IN' },
      { token: 'Hastings', tag: 'NNP' },
      { token: '.', tag: 'SB' }
    ];

    var actual = postagger.tag('The Battle of Hastings.');

    actual.should.eql(expected);
  });

});
