define(['pos_tagger'], function (pos_tagger) {
  var keyword_extractor;

  if (typeof keyword_extractor !== 'undefined')
    return keyword_extractor;

  keyword_extractor = {
    extractFrom: function (text) {
      var tagged = pos_tagger.tag(text);
      var keywords = ['Hello', 'world'];
      var keyphrases = ['Hello world'];

      return {
        keywords: keywords,
        keyphrases: keyphrases
      };
    }
  };

  return keyword_extractor;
});