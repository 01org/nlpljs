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

var keyphrase_extractor = require('../../src/libnlp').keyphrase_extractor;

describe('keyphrase_extractor', function () {

  it('should extract noun phrases', function () {
    var text = 'The Battle of Hastings was fought in 1066. It was ' +
               'part of the Norman Conquest of England.';

    var expected_keywords = [
      'battle of hastings',
      'norman conquest of england'
    ];

    var actual = keyphrase_extractor.extractFrom(text);

    actual.keywords.should.eql(expected_keywords);

    for (var i = 0; i < actual.scores.length; i++) {
      actual.scores[i].should.be.a('number');
    }
  });

});
