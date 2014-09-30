var chai = require('chai');
var expect = chai.expect;
var FrameChooser = require('./../../app/content-push/image-card-frame-chooser');

describe('FrameChooser', function () {

  var makeStubImageItem = function (width, height) {
    return { width: width, height: height, ratio: width / height };
  };

  var frameChooser = new FrameChooser();

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

  it('should choose the landscape2 frame correctly', function () {
    var landscapeImage = makeStubImageItem(350, 250);
    var frame = frameChooser.choose(landscapeImage);
    expect(frame).to.eql(frameChooser.getFrameByName('landscape2'));
  });

});
