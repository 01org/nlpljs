define(['tokenizer'], function () {
  var tokenizer;

  if (typeof tokenizer !== 'undefined')
    return tokenizer;

  tokenizer =  {
    tokenize: function (text) {
      return ['Hello', 'world', '!'];
    }
  };

  return tokenizer;
});