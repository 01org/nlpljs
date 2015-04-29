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
chai.should();
var expect = chai.expect;
var ArrayUtils = require('./../../app/content_push/cp-array-utils');

describe('ArrayUtils', function () {
  var kw1 = { text: 'battle of hastings', score: 1.66, groupId: 1 };
  var kw2 = { text: 'harold hardrada', score: 1.25, groupId: 2 };
  var kw3 = { text: 'battle of fulford', score: 1.1, groupId: 3 };
  var kw4 = { text: 'archbishop of york', score: 0.9, groupId: 4 };
  var kw5 = { text: 'edward ii', score: 0.7, groupId: 5 };

  it('should find the diff between two arrays', function () {
    var arr1 = [kw1, kw2, kw3];
    var arr2 = [kw1, kw2, kw3, kw4, kw5];

    var expected = [kw4, kw5];

    var actual = ArrayUtils.diff(arr1, arr2, function (elt1, elt2) {
      return elt1.text === elt2.text;
    });

    actual.should.eql(expected);
  });

  it('should ignore elements in the first array which aren\'t in the second', function () {
    var arr1 = [kw1, kw2, kw3];
    var arr2 = [kw3, kw4, kw5];

    var expected = [kw4, kw5];

    var actual = ArrayUtils.diff(arr1, arr2, function (elt1, elt2) {
      return elt1.text === elt2.text;
    });

    actual.should.eql(expected);
  });

  it('should return an empty array if second array has no elements not in first', function () {
    var arr1 = [kw1, kw2, kw3, kw4, kw5];
    var arr2 = [kw3, kw4, kw5];

    var expected = [];

    var actual = ArrayUtils.diff(arr1, arr2, function (elt1, elt2) {
      return elt1.text === elt2.text;
    });

    actual.should.eql(expected);
  });
});
