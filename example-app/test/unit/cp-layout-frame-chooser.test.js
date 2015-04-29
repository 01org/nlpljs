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
var FrameChooser = require('./../../app/content_push/cp-layout-frame-chooser');

describe('FrameChooser', function () {

  var makeStubImageItem = function (width, height) {
    return { width: width, height: height, ratio: width / height };
  };

  var frameChooser = new FrameChooser(54, 54);

  it('should choose the small frame correctly', function () {
    var smallSquareImage = makeStubImageItem(150, 150);
    var frame = frameChooser.choose(smallSquareImage);
    expect(frame).to.eql(frameChooser.getFrameByName('small_square'));
  });

  it('should choose the large frame correctly', function () {
    var largeSquareImage = makeStubImageItem(250, 250);
    var frame = frameChooser.choose(largeSquareImage);
    expect(frame).to.eql(frameChooser.getFrameByName('large_square'));
  });

  it('should choose the portrait frame correctly', function () {
    var portraitImage = makeStubImageItem(150, 250);
    var frame = frameChooser.choose(portraitImage);
    expect(frame).to.eql(frameChooser.getFrameByName('portrait'));
  });

  it('should choose the landscape1 frame correctly', function () {
    var landscapeImage = makeStubImageItem(250, 150);
    var frame = frameChooser.choose(landscapeImage);
    expect(frame).to.eql(frameChooser.getFrameByName('landscape1'));
  });

});
