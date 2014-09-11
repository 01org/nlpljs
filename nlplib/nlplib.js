define(['tokenizer', 'postagger'], function (tokenizer, postagger) {
  var nlplib;

  if (typeof nlplib !== 'undefined')
    return nlplib;

  nlplib =  {
    tokenizer: tokenizer,
    postagger: postagger
  };

  return nlplib;
});