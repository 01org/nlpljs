require('chai').should();

var KeywordSelector = require('./../../app/content_push/cp-keyword-selector');
var ArrayUtils = require('./../../app/content_push/cp-array-utils');

describe('KeywordSelector', function () {
  var keywordSelector;
  var kw1 = {text: 'a'};
  var kw1_1 = {text: 'a'};
  var kw2 = {text: 'b'};
  var kw2_1 = {text: 'b'};
  var kw3 = {text: 'c'};
  var kw4 = {text: 'd'};
  var kw5 = {text: 'e'};
  var kw6 = {text: 'f'};
  var kw7 = {text: 'g'};

  beforeEach(function () {
    keywordSelector = new KeywordSelector(ArrayUtils);
  });

  it('should return no current keywords if no active keywords', function () {
    keywordSelector.getCurrentKeywords().should.eql([]);
  });

  it('should return first 1 + <width>% active keywords as current keywords', function () {
    keywordSelector.setActiveKeywords([kw1, kw2, kw3, kw4, kw5, kw6, kw7]);
    keywordSelector.setWidth(0.5);
    keywordSelector.getCurrentKeywords().should.eql([kw1, kw2, kw3]);
  });

  it('should return 1 current keyword when width is 0', function () {
    keywordSelector.setActiveKeywords([kw1, kw2, kw3, kw4, kw5, kw6, kw7]);
    keywordSelector.setWidth(0);
    keywordSelector.getCurrentKeywords().should.eql([kw1]);
  });

  it('should return all active keywords when width is 1', function () {
    keywordSelector.setActiveKeywords([kw1, kw2, kw3, kw4, kw5, kw6, kw7]);
    keywordSelector.setWidth(1);
    keywordSelector.getCurrentKeywords().should.eql([kw1, kw2, kw3, kw4, kw5]);
  });

  it('should replace all active keywords each time setActiveKeywords() is called', function () {
    keywordSelector.setWidth(1);
    keywordSelector.setActiveKeywords([kw1, kw2, kw3]);
    keywordSelector.getCurrentKeywords().should.eql([kw1, kw2, kw3]);
    keywordSelector.setActiveKeywords([kw4, kw5, kw6]);
    keywordSelector.getCurrentKeywords().should.eql([kw4, kw5, kw6]);
  });

  it('should not lose stored keywords when active keywords change', function () {
    keywordSelector.setActiveKeywords([kw1, kw2, kw3]);
    keywordSelector.keywords.should.eql({
      'a': [kw1],
      'b': [kw2],
      'c': [kw3]
    });

    keywordSelector.setActiveKeywords([kw4, kw5, kw6]);
    keywordSelector.keywords.should.eql({
      'a': [kw1],
      'b': [kw2],
      'c': [kw3],
      'd': [kw4],
      'e': [kw5],
      'f': [kw6]
    });
  });

  it('should store keywords as a hash when active keywords are set', function () {
    var expected = {
      'a': [kw1, kw1_1],
      'b': [kw2, kw2_1],
      'c': [kw3],
      'd': [kw4]
    };

    keywordSelector.setActiveKeywords([kw1, kw1_1, kw2, kw2_1, kw3, kw4]);
    keywordSelector.keywords.should.eql(expected);
  });

  it('should return all new keywords as changed keywords when no active keywords', function () {
    keywordSelector.setWidth(1);
    var input = [kw1, kw2, kw3];
    keywordSelector.checkKeywordInfoChanged(input).should.eql(input);
  });

  it('should compare 1 + <width>% slice of new keywords with current keywords', function () {
    /* only consider one keyword at a time, however many new ones there are */
    keywordSelector.setWidth(0);

    /* kw1 is the only active keyword */
    keywordSelector.setActiveKeywords([kw1, kw4, kw5]);

    /* kw1 is current, so should be change notification for kw2 and kw3 */
    var input = [kw1, kw2, kw3];
    keywordSelector.checkKeywordInfoChanged(input).should.eql([kw2, kw3]);

    /* because kw4 and kw5 aren't current (even though they are active),
       it should notify a change */
    input = [kw4, kw5];
    keywordSelector.checkKeywordInfoChanged(input).should.eql([kw4, kw5]);
  });

});
