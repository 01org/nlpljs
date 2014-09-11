define(['tokenizer', 'pos_tagger', 'keyword_extractor', 'contextualizer'],
function (tokenizer, pos_tagger, keyword_extractor, contextualizer) {
  var nlplib;

  if (typeof nlplib !== 'undefined')
    return nlplib;

  nlplib =  {
    tokenizer: tokenizer,
    pos_tagger: pos_tagger,
    keyword_extractor: keyword_extractor,
    contextualizer: contextualizer
  };

  pos_tagger.fromJSON('model file goes here');

  console.log("Working????");
  return nlplib;
});