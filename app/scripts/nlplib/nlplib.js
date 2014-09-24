define(['tokenizer', 'postagger', 'keyphrase_extractor'], function (tokenizer,
  postagger, keyphrase_extractor) {
  var nlplib;

  if (typeof nlplib !== 'undefined')
    return nlplib;

  nlplib =  {
    tokenizer: tokenizer,
    postagger: postagger,
    keyphrase_extractor: keyphrase_extractor
  };

  return nlplib;
});