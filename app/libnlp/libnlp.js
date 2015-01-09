(function () {
  var makeLibnlp = function (tokenizer, postagger, keyphrase_extractor) {
    return {
      tokenizer: tokenizer,
      postagger: postagger,
      keyphrase_extractor: keyphrase_extractor
    };
  };

  if (typeof define !== 'undefined' && define.amd) {
    define(
      ['tokenizer', 'postagger', 'keyphrase_extractor'],
      function (tokenizer, postagger, keyphrase_extractor) {
        return makeLibnlp(tokenizer, postagger, keyphrase_extractor);
      }
    );
  } else {
    var tokenizer = require('./tokenizer');
    var postagger = require('./postagger');
    var keyphrase_extractor = require('./keyphrase_extractor');
    module.exports = makeLibnlp(tokenizer, postagger, keyphrase_extractor);
  }
})();
