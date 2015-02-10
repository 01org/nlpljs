#!/usr/bin/env node
/* get keyphrases from a piece of text (with pageranks) [echo or
   cat the text to process into this script];
   for each, do a barrage of dbpedia lookups to get stats
   about related articles */
var libnlp = require('../../../src/libnlp');
var tester = require('./keyphrase-dbpedia-tester');
var _ = require('../../app/bower_components/lodash/dist/lodash');

/* this is used to set the queriesToRun argument passed to
   tester.getDBpediaStats() */
var queriesToRun = [
  'isExactArticle',
  //'isAnyArticle',
  //'isUsefulArticle',
  //'selectArticleTypes',
  //'selectArticles'
];

var input = '';

var originalKeywords = [];
var out = [];
var longestSearch = null;

var STOP_WORDS = ['And', 'Of', 'From', 'For', 'The', 'At', 'On', 'In', 'As'];

/* this is to fix the lowercasing of all keywords temporarily */
var titleize = function (word) {
  /* uppercase first letter of all words */
  word = word.replace(/(?:^|\s|-)\S/g, function (c) {
    return c.toUpperCase();
  });

  /* lowercase "of", "and", "from" and other prepositions */
  var regex;
  _.each(STOP_WORDS, function (rep) {
    regex = new RegExp(' ' + rep + ' ', 'g');
    word = word.replace(regex, ' ' + rep.toLowerCase() + ' ');
  });

  /* "the" should be lowercase unless it's the first word */
  word = word.replace(/^the/, 'The');

  /* HACK replace Roman numerals which have been lowercased with their
     uppercase equivalent */
  /*word = word.replace(/ [ixvmc]+/gi, function (m) {
    return m.toUpperCase();
  });*/

  return word;
};

/* remove stop words */
var noStop = function (word) {
  var regex;
  _.each(STOP_WORDS, function (rep) {
    regex = new RegExp(' ' + rep + ' ', 'gi');
    word = word.replace(regex, ' ');
  });

  return word;
};

/* format keywords and their scores as a newline separated list */
var formatKeywords = function (keywords) {
  return _.reduce(keywords, function (memo, keywordObj) {
    memo += keywordObj.keyword + ', ' +
            (keywordObj.keywordNoStop ? keywordObj.keywordNoStop + ', ' : '') +
            keywordObj.score + '\n';
    return memo;
  }, '');
};

/* rank keywords by order (0 = lowest), then alphabetically sort;
   then convert to string */
var keywordOrder = function (keywords) {
  var keywordsWithOrder = _.map(keywords, function (keyword, index) {
    keyword.order = (keywords.length - 1) - index;
    return keyword;
  });

  var sortedByAlpha = _.sortBy(keywordsWithOrder, 'keyword');

  return _.reduce(sortedByAlpha, function (memo, keywordObj) {
    memo += keywordObj.keyword + ', ' + keywordObj.order + '\n';
    return memo;
  }, '');
};

var showResults = function (queriesRun, duration, longestSearch, originalScores, newScores) {
  /* sort results */
  newScores = _.sortBy(newScores, 'score').reverse();

  /* sort original keywords */
  originalScores = _.sortBy(originalScores, 'score').reverse();

  /* show comparison */
  console.log();
  console.log('*************************************');
  console.log('DBPEDIA FETCH TIME: ' + duration + 'ms');

  if (longestSearch) {
    console.log('LONGEST SEARCH: ' + longestSearch.time +
                'ms for keyword "' + longestSearch.keyword + '"');
  }

  console.log('\n************** RESULTS **************\n');
  console.log('QUERIES USED:\n');
  console.log(queriesRun.join('\n'));
  console.log();
  console.log('PAGERANK ONLY (HIGHEST SCORE FIRST)\n');
  console.log(formatKeywords(originalScores));
  console.log('PAGERANK + VAGUENESS (HIGHEST SCORE FIRST)\n');
  console.log(formatKeywords(newScores));
  console.log('PAGERANK + VAGUENESS (ALPHABETICAL WITH ORDER)\n');
  console.log(keywordOrder(newScores));
  console.log('*************************************');
  console.log();
};

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  console.log('parsing input...');

  var parsed = libnlp.keyphrase_extractor.extractFrom(input);

  console.log('...parse done');

  _.each(parsed.keywords, function (keyword, index) {
    /* HACK re-capitalise keywords */
    var titleized = titleize(keyword);
    var keywordNoStop = noStop(titleized);

    out.push({
      keyword: titleized,
      keywordNoStop: keywordNoStop,
      pagerank: parsed.scores[index]
    });

    originalKeywords.push({
      keyword: keyword,
      score: parsed.scores[index]
    });
  });

  var promises = [];

  _.each(out, function (keywordObj) {
    var promise = tester.getDBpediaStats(keywordObj, queriesToRun);

    promise.then(
      function (result) {
        _.extend(keywordObj, result);

        if (!keywordObj.retrieved) {
         console.error('ERROR: unable to get dbpedia results for "' +
                       keywordObj.keyword + '"; error was:\n' +
                       keywordObj.errorText);
        }

        if (!longestSearch || result.time > longestSearch.time) {
          longestSearch = {
            time: result.time,
            keyword: keywordObj.keyword
          };
        }
      }
    );

    promises.push(promise);
  });

  var start = (new Date()).getTime();

  Promise.all(promises).then(
    function (results) {
      var end = (new Date()).getTime();
      var duration = end - start;

      /* sum all numerical values: page ranks, number of article types,
         number of articles etc. */
      var sums = {};

      _.each(out, function (keywordObj) {
        _.each(keywordObj.info, function (value, key) {
          if (_.isNumber(value)) {
            if (!sums[key]) {
              sums[key] = 0;
            }

            sums[key] += value;
          }
        });
      });

      var score;
      var vagueness;

      /* normalise numeric values */
      _.each(out, function (keywordObj) {
        _.each(sums, function (value, key) {
          if (_.isNumber(value)) {
            /* don't reset a page rank of 0 */
            if (key !== 'pagerank' && !keywordObj.info[key]) {
              keywordObj.info[key] = 1;
            } else {
              keywordObj.info[key] /= sums[key];
            }
          }
        });

        vagueness = 0;
        numValues = 0;

        /* add up vagueness values, but only using keys which
           occur in the queriesToRun array */
        _.each(queriesToRun, function (key) {
          var value = keywordObj.info[key];

          if (_.isNumber(value)) {
            vagueness += value;
            numValues++;
          } else if (_.isBoolean(value)) {
            vagueness += (value ? 0 : 1);
            numValues++;
          }
        });

        if (numValues > 0) {
          vagueness = vagueness / numValues;
        }

        /* page rank and vagueness have equal weight */
        keywordObj.score = (keywordObj.info.pagerank + (1 - vagueness)) / 2;
      });

      showResults(queriesToRun, duration, longestSearch, originalKeywords, out);
    },

    function (err) {
      var end = (new Date()).getTime();
      var duration = end - start;
      console.log('ERROR OCCURRED, STILL SHOWING RESULTS');
      showResults(queriesToRun, duration, longestSearch, originalKeywords, out);
    }
  );
});
