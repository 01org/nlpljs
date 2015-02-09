// compare our tokenizer against the de facto standard NLP library
// for JS (natural) and another smaller and simpler library (nlp_compromise)
var path = require('path');
var fs = require('fs');

var _ = require('../../app/bower_components/lodash/dist/lodash');
var Benchmark = require('benchmark');

var libnlp = require('../../app/libnlp/libnlp');
var nlpc = require('nlp_compromise');
var nlpn = require('natural');
var nlpn_tagger = new nlpn.();

var textPath = path.join(__dirname, 'battle-of-hastings.txt');
var text = fs.readFileSync(textPath, 'utf8');

var suite = new Benchmark.Suite;

suite
.add('libnlp.tokenizer#tokenize', function () {
  libnlp.tokenizer.tokenize(text);
})
.add('nlp_compromise#tokenize', function () {
  nlpc.tokenize(text);
})
.add('natural.WordTokenizer#tokenize', function () {
  nlpn_tokenizer.tokenize(text);
})
.on('complete', function () {
  this.forEach(function (bench) {
    console.log(bench.name + ': ' + bench.times.elapsed + ' seconds');
  });
})
.run({async: true});
