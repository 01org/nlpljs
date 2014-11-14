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
  it('should choose lay out large square tiles correctly with landscape tiles', function () {
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

});
