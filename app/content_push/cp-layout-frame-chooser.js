(function () {
  // frames around cp-tile* elements inside a cp-layout
  var FRAMES = [
    { name: 'large_square', columns: 1, rows: 1 },
    { name: 'landscape', columns: 2, rows: 1 }
  ];

  // images get a random frame from this array
  var IMAGE_FRAMES = [
    { name: 'image1', columns: 1, rows: 1 },
    { name: 'image2', columns: 2, rows: 1 }
  ];

  var FrameChooser = function () {};

  /* expose FRAMES so we can reference it directly
     from tile implementations (if a particular tile should always
     have a fixed-size frame) */
  FrameChooser.FRAMES = {};
  var allFrames = FRAMES.concat(IMAGE_FRAMES);
  for (var i = 0; i < allFrames.length; i++) {
    FrameChooser.FRAMES[allFrames[i].name] = FRAMES[i];
  }

  /**
   * Choose a frame from IMAGE_FRAMES for imageItem.
   * @returns an item from IMAGE_FRAMES randomly
   */
  FrameChooser.prototype.choose = function () {
    var num = parseInt(Math.random() * IMAGE_FRAMES.length, 10);
    return IMAGE_FRAMES[num];
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrameChooser;
  }
  else {
    window.FrameChooser = FrameChooser;
  }
})();
