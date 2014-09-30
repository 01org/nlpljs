(function () {
  var FrameChooser = function () {};

  // frames around image-item elements inside an image-card;
  // NB the first item in this object will be the default if
  // no other frame is suitable
  FrameChooser.prototype.FRAMES = [
    { name: 'small_square', width: 104, height: 104, widthPercent: 50, ratio: 1 },
    { name: 'large_square', width: 212, height: 212, widthPercent: 100, ratio: 1 },
    { name: 'portrait', width: 104, height: 212, widthPercent: 50, ratio: 0.49 },
    { name: 'landscape1', width: 212, height: 104, widthPercent: 100, ratio: 2.04 },
    { name: 'landscape2', width: 212, height: 158, widthPercent: 100, ratio: 1.34 }
  ];

  /**
   * Convenience function to get a frame by name (inefficient).
   *
   * @param String frameName Name of frame to retrieve.
   *
   * @returns null if named frame is not found
   */
  FrameChooser.prototype.getFrameByName = function (frameName) {
    for (var key in this.FRAMES) {
      if (this.FRAMES.hasOwnProperty(key)) {
        if (this.FRAMES[key].name === frameName) {
          return this.FRAMES[key];
        }
      }
    }

    return null;
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
    var betterCandidate;
    var ratioDiff;
    var sizeDiff;
    var heightDiff;
    var widthDiff;

    // the image must be the same height or taller than the frame
    // for the frame to be a candidate
    var heightGreater;

    for (var i = 0; i < this.FRAMES.length; i++) {
      candidateFrame = this.FRAMES[i];

      ratioDiff = Math.abs(candidateFrame.ratio - imageItem.ratio);

      widthDiff = Math.abs(candidateFrame.width - imageItem.width);
      heightDiff = Math.abs(candidateFrame.height - imageItem.height);
      sizeDiff = widthDiff + heightDiff;
      heightGreater = (imageItem.height > candidateFrame.height);

      betterCandidate = !chosenFrame ||
                        (ratioDiff < nearestRatio && heightGreater) ||
                        (ratioDiff === nearestRatio && sizeDiff < nearestSize && heightGreater);

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
