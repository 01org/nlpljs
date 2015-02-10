var chai = require('chai');
var expect = chai.expect;
chai.should();

var tokenizer = require('../../src/libnlp').tokenizer;

describe('tokenizer', function () {

  it('should tokenize a simple string of words with no punctuation', function () {
    var text = 'hello world what a nice day it is';
    var expected = ['hello', 'world', 'what', 'a', 'nice', 'day', 'it', 'is'];
    tokenizer.tokenize(text).should.eql(expected);
  });

  it('should tokenize a string which is just punctuation and spaces', function () {
    var text = ' . ';
    var expected = ['.'];
    var actual = tokenizer.tokenize(text);
    actual.should.eql(expected);
  });

  it('should tokenize a string with punctuation and extra spaces', function () {
    var text = '  Hello world, what a   nice   day   it is! Let\'s go for a walk .  ';
    var expected = ['Hello', 'world', ',', 'what', 'a', 'nice', 'day',
                    'it', 'is', '!', 'Let', '\'s', 'go', 'for', 'a',
                    'walk', '.'];

    var actual = tokenizer.tokenize(text);

    actual.should.eql(expected);
  });

  it('should handle special characters as tokens', function () {
    var text = '£100 is roughly $80. {if you are an American man@home}';
    var expected = ['£', '100', 'is', 'roughly', '$', '80', '.', '{',
                    'if', 'you', 'are', 'an', 'American', 'man', '@',
                    'home', '}'];
    var actual = tokenizer.tokenize(text);
    actual.should.eql(expected);
  });

});
