#!/usr/bin/env node
/* get keyphrases from a piece of text (with pageranks);
   for each, do a barrage of dbpedia lookups to get stats
   about related articles */
var libnlp = require('../../app/libnlp/libnlp');
var tester = require('./keyphrase-dbpedia-tester');
var _ = require('../../app/bower_components/lodash/dist/lodash');

var input = '';

var originalKeywords = [];
var out = [];
var longestSearch = null;

/* format keywords and their scores as a comma-separated list */
var formatKeywords = function (keywords) {
  return _.reduce(keywords, function (memo, keywordObj) {
    if (memo !== '') {
      memo += ', ';
    }

    memo += keywordObj.keyword + ' (' + keywordObj.score + ')';

    return memo;
  }, '');
};

var titleize = function (word) {
  word = word.replace(/(?:^|\s|-)\S/g, function (c) {
    return c.toUpperCase();
  });

  /* lowercase "of", "and", "from" and other prepositions */
  var toLower = ['And', 'Of', 'From', 'For', 'The', 'At', 'On', 'In', 'As'];
  var regex;
  _.each(toLower, function (rep) {
    regex = new RegExp(' ' + rep + ' ', 'g');
    word = word.replace(regex, ' ' + rep.toLowerCase() + ' ');
  });

  /* "the" should be lowercase unless it's the first word */
  word = word.replace(/^the/, 'The');

  /* HACK replace Roman numerals which have been lowercased with their
     uppercase equivalent */
  word = word.replace(/ [ixvmc]+/gi, function (m) {
    return m.toUpperCase();
  });

  return word;
};

var showResults = function (duration, longestSearch, originalScores, newScores) {
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

  console.log('************** RESULTS **************');
  console.log('ORIGINAL ORDER (PAGERANK ONLY), HIGHEST SCORE FIRST');
  console.log(formatKeywords(originalScores));
  console.log();
  console.log('ENHANCED ORDER (AFTER DBPEDIA LOOKUP), HIGHEST SCORE FIRST');
  console.log(formatKeywords(newScores));
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

  _.each(parsed.keywords, function (keyword, index) {
    /* HACK re-capitalise keywords */
    var titleized = titleize(keyword);

    out.push({
      keyword: titleized,
      pagerank: parsed.scores[index]
    });

    originalKeywords.push({
      keyword: keyword,
      score: parsed.scores[index]
    });
  });

  var promises = [];

  _.each(out, function (keywordObj) {
    console.log('testing keyword "' + keywordObj.keyword + '"');

    var promise = tester.getDBpediaStats(keywordObj.keyword);

    promise.then(
      function (result) {
        _.extend(keywordObj, result.info);
        keywordObj.time = result.time;

        if (!keywordObj.retrieved) {
         console.error('ERROR: unable to get dbpedia results for "' +
                       keywordObj.keyword + '"');
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

      /* sum page ranks, number of article types and
         number of articles */
      var totalPageRank = 0;
      var totalNumArticles = 0;
      var totalNumArticleTypes = 0;

      _.each(out, function (keywordObj) {
        totalPageRank += keywordObj.pagerank;
        totalNumArticles += keywordObj.numArticles;
        totalNumArticleTypes += keywordObj.numArticleTypes;
      });

      /* normalise page ranks, number of article types and number
         of articles; combine with scores for is* queries to get
         final rank */
      var score;
      var vagueness;
      _.each(out, function (keywordObj) {
        keywordObj.normalisedPagerank = keywordObj.pagerank / totalPageRank;

        if (keywordObj.isAnyArticle) {
          keywordObj.numArticles /= totalNumArticles;
          keywordObj.numArticleTypes /= totalNumArticleTypes;
        } else {
          /* no articles, so extra penalty */
          keywordObj.numArticles = 1;
          keywordObj.numArticleTypes = 1;
        }

        vagueness = (keywordObj.numArticles +
                     keywordObj.numArticleTypes +
                     (keywordObj.isAnyArticle ? 0 : 1) +
                     (keywordObj.isExactArticle ? 0 : 1) +
                     (keywordObj.isUsefulArticle ? 0 : 1)) / 3;

        vagueness = (keywordObj.isExactArticle ? 0 : 1);

        console.log(keywordObj.keyword + ' vagueness ' + vagueness);

        /* page rank and vagueness have equal weight */
        keywordObj.score = (keywordObj.normalisedPagerank + (1 - vagueness)) / 2;
      });

      showResults(duration, longestSearch, originalKeywords, out);
    },

    function (err) {
      var end = (new Date()).getTime();
      var duration = end - start;
      console.log('ERROR OCCURRED, STILL SHOWING RESULTS');
      showResults(duration, longestSearch, originalKeywords, out);
    }
  );
});
