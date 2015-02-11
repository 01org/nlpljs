var chai = require('chai');
var expect = chai.expect;
chai.should();

var postagger = require('../../src/libnlp').postagger;

describe('postagger', function () {

  it('should assign part of speech tags to a text', function () {
    var text = 'The Battle of Hastings was fought in 1066. It was ' +
               'part of the Norman Conquest of England.';

    var expected = [
      { token: 'The', tag: 'DT' },
      { token: 'Battle', tag: 'NNP' },
      { token: 'of', tag: 'IN' },
      { token: 'Hastings', tag: 'NNP' },
      { token: 'was', tag: 'VBD' },
      { token: 'fought', tag: 'VBN' },
      { token: 'in', tag: 'IN' },
      { token: '1066', tag: 'CD' },
      { token: '.', tag: 'SB' },
      { token: 'It', tag: 'PRP' },
      { token: 'was', tag: 'VBD' },
      { token: 'part', tag: 'NN' },
      { token: 'of', tag: 'IN' },
      { token: 'the', tag: 'DT' },
      { token: 'Norman', tag: 'NNP' },
      { token: 'Conquest', tag: 'NN' },
      { token: 'of', tag: 'IN' },
      { token: 'England', tag: 'NNP' },
      { token: '.', tag: 'SB' }
    ];

    var actual = postagger.tag(text);

    actual.should.eql(expected);
  });

});
