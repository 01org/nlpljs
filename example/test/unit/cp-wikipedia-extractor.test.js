require('chai').should();

var WikipediaExtractor = require('./../../app/content_push/cp-wikipedia-extractor');

var p1 = "<b>Bayeux</b> is a city in <a href=\"/wiki/Category:Basse-Normandie\" title=\"Category:Basse-Normandie\">Basse-Normandie</a>, France.";

var p2 = "<b>Bayeux</b> is a city in <a href=\"/wiki/Category:Basse-Normandie\" title=\"Category:Basse-Normandie\">Basse-Normandie</a>, France is it not.";

var div1 = "hello world";

describe('WikipediaExtractor', function () {

  it('should extract the first two paragraphs', function () {
    var html1 = '<p>' + p1 + '</p><p>' + p2 + '</p>';

    var extractor = new WikipediaExtractor();

    var expected = {
      text: [p1, p2],
      images: []
    };

    var actual = extractor.parse(html1);

    actual.should.eql(expected);
  });

  it('should extract the first paragraph and div', function () {
    var html2 = '<p>' + p1 + '</p><div>' + div1 + '</div>';

    var extractor = new WikipediaExtractor();

    var expected = {
      text: [p1, div1],
      images: []
    };

    var actual = extractor.parse(html2);

    actual.should.eql(expected);
  });

});
