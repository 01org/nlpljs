define(['tokenizer'], function (tokenizer) {
  var pos_tagger;
  var model;

  if (typeof pos_tagger !== 'undefined')
    return postagger;

  pos_tagger =  {
    tag: function (text) {
      var tagged = [];
      var tokenized = tokenizer.tokenize(text);

      tagged[0] = { token: tokenized[0], tag: 'NN' };
      tagged[1] = { token: tokenized[1], tag: 'NN' };
      tagged[2] = { token: tokenized[2], tag: '!' };

      return tagged;
    },
    train: function (corpus) {
      return this;
    },
    finalizeTraining: function () {
      return this;
    },
    fromJSON: function (jsonFile) {
      model = jsonFile;
      return this;
    },
    getJSON: function () {
      return JSON.stringify(model, null, 4);
    }
  };

  return pos_tagger;
});