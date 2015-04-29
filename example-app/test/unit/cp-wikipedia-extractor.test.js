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

require('chai').should();

var WikipediaExtractor = require('./../../app/content_push/cp-wikipedia-extractor');

var p1 = "<b>Bayeux</b> is a city in <a href=\"/wiki/Category:Basse-Normandie\" title=\"Category:Basse-Normandie\">Basse-Normandie</a>, France.";

var p2 = "<b>Bayeux</b> is a city in <a href=\"/wiki/Category:Basse-Normandie\" title=\"Category:Basse-Normandie\">Basse-Normandie</a>, France is it not.";

var div1 = "hello world";

describe('WikipediaExtractor', function () {

  it('should extract the first two paragraphs', function () {
    var html1 = '<p>' + p1 + '</p><p>' + p2 + '</p>';

    var extractor = new WikipediaExtractor();

    var expected = {
      text: [p1, p2],
      images: []
    };

    var actual = extractor.parse(html1);

    actual.should.eql(expected);
  });

  it('should extract the first paragraph and div', function () {
    var html2 = '<p>' + p1 + '</p><div>' + div1 + '</div>';

    var extractor = new WikipediaExtractor();

    var expected = {
      text: [p1, div1],
      images: []
    };

    var actual = extractor.parse(html2);

    actual.should.eql(expected);
  });

});
