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

(function () {
  'use strict';

  // frames around image-item elements inside a cp-layout;
  // NB the first item in this object will be the default if
  // no other frame is suitable
  var FRAMES = [
    { name: 'small_square', rows: 2, columns: 2, ratio: 1 },
    //{ name: 'large_square', rows: 4, columns: 4, ratio: 1 },
    { name: 'portrait', columns: 2, rows: 4, ratio: 0.5 },
    { name: 'landscape1', columns: 4, rows: 2, ratio: 2 }
    //{ name: 'landscape2', columns: 4, rows: 3, ratio: 1.333333 }
  ];

  var FrameChooser = function (columnWidth, rowHeight) {
    this.columnWidth = columnWidth || 1;
    this.rowHeight = rowHeight || 1;
  };

  /* expose FRAMES so we can reference it directly
     from tile implementations (if a particular tile should always
     have a fixed size frame) */
  FrameChooser.FRAMES = {};
  for (var i = 0; i < FRAMES.length; i++) {
    FrameChooser.FRAMES[FRAMES[i].name] = FRAMES[i];
  }

  /**
   * Convenience function to get a frame by name (inefficient).
   *
   * @param String frameName Name of frame to retrieve.
   *
   * @returns null if named frame is not found
   */
  FrameChooser.prototype.getFrameByName = function (frameName) {
    return FrameChooser.FRAMES[frameName] || null;
  };

  /**
   * Choose a frame from FRAMES for imageItem; the frame with the
   * closest ratio which is shorter than the image is preferred;
   * the closeness of the size of the frame is used as a tie-breaker
   * if two candidate frames have the same ratio and are shorter
   * than the image.
   *
   * @param Object imageItem Image item to choose a frame for;
   * must have width, height and ratio properties
   * (e.g. image-item elements satisfy this)
   *
   * @returns an item from FrameChooser.FRAMES
   */
  FrameChooser.prototype.choose = function (imageItem) {
    // best so far
    var nearestRatio;
    var nearestSize;

    // chosen frame so far
    var chosenFrame;

    var candidateFrame;
    var candidateFrameWidth;
    var candidateFrameHeight;
    var betterCandidate;
    var ratioDiff;
    var sizeDiff;
    var heightDiff;
    var widthDiff;

    // the image must be the same height or taller than the frame
    // for the frame to be a candidate
    var heightGreaterOrEqual;

    for (var i = 0; i < FRAMES.length; i++) {
      candidateFrame = FRAMES[i];
      candidateFrameWidth = candidateFrame.columns * this.columnWidth;
      candidateFrameHeight = candidateFrame.rows * this.rowHeight;

      ratioDiff = Math.abs(candidateFrame.ratio - imageItem.ratio);

      widthDiff = Math.abs(candidateFrameWidth - imageItem.width);
      heightDiff = Math.abs(candidateFrameHeight - imageItem.height);
      sizeDiff = widthDiff + heightDiff;
      heightGreaterOrEqual = (imageItem.height >= candidateFrameHeight);

      betterCandidate = !chosenFrame ||
                        (ratioDiff < nearestRatio && heightGreaterOrEqual) ||
                        (ratioDiff === nearestRatio && sizeDiff < nearestSize
                         && heightGreaterOrEqual);

      if (betterCandidate) {
        chosenFrame = candidateFrame;
        nearestRatio = ratioDiff;
        nearestSize = sizeDiff;
      }
    }

    return chosenFrame;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrameChooser;
  }
  else {
    window.FrameChooser = FrameChooser;
  }
})();
