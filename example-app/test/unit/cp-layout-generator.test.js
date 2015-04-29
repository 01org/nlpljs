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
var LayoutGenerator = require('./../../app/content_push/cp-layout-generator');

describe('LayoutGenerator', function () {

  var layoutGenerator = new LayoutGenerator();

  /* test situation where the following tile sequence:

     width=4,height=4
     width=4,height=2
     width=4,height=2

     results in the 4x4 tile being underneath both 4x2 tiles
  */
  it('should lay out large square tiles correctly with landscape tiles', function () {
    var testShapes = [
      {width: 4, height: 4},
      {width: 4, height: 2},
      {width: 4, height: 2}
    ];

    var gridWidth = 4;

    var expectedPlacements = [
      {
        shape: testShapes[0],
        position: {
          rows: [0,1,2,3], columns: [0,1,2,3]
        }
      },
      {
        shape: testShapes[1],
        position: {
          rows: [4,5], columns: [0,1,2,3]
        }
      },
      {
        shape: testShapes[2],
        position: {
          rows: [6,7], columns: [0,1,2,3]
        }
      }
    ];

    var actual = layoutGenerator.generate(testShapes, gridWidth);

    actual.placements.should.eql(expectedPlacements);
  });

  it('should lay out a single shape', function () {
    var testShape = {width: 4, height: 4};

    var gridWidth = 4;

    var expectedPlacements = [
      {
        shape: testShape,
        position: {
          rows: [0,1,2,3], columns: [0,1,2,3]
        }
      }
    ];

    var actual = layoutGenerator.generate([testShape], gridWidth);

    actual.placements.should.eql(expectedPlacements);
  });

});
