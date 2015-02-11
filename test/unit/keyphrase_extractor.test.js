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
