define(['tokenizer', 'postagger', 'keyphrase_extractor'], function (tokenizer,
  postagger, keyphrase_extractor) {
  var libnlp;

  if (typeof libnlp !== 'undefined') {
    return libnlp;
  }

  libnlp =  {
    tokenizer: tokenizer,
    postagger: postagger,
    keyphrase_extractor: keyphrase_extractor
  };

  return libnlp;
});
