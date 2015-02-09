#!/usr/bin/env node
/* ask dbpedia about a key phrase
   usage: ./dbpedia-ask.js "key phrase" */

var tester = require('./keyphrase-dbpedia-tester');
var query = process.argv[2];

var msg = 'dbpedia has an article whose label ';
var nomsg = 'dbpedia DOES NOT have an article whose label ';
var successMsg;
var failMsg;

var makeBooleanResponseHandler = function (successMsg, failMsg) {
  return function (response) {
    if (response.body.boolean) {
      console.log('TIME: ' + response.time + 'ms - SUCCESS: ' + successMsg);
    } else {
      console.error('TIME: ' + response.time + 'ms - FAIL: ' + failMsg);
    }
  };
};

/* is there any article whose label contains the words in <query>? */
successMsg = msg + 'contains the words in "' + query + '"';
failMsg = nomsg + 'contains the words in "' + query + '"';
tester.isAnyArticle(query).then(
  makeBooleanResponseHandler(successMsg, failMsg),
  console.error
);

/* is there an article whose label exactly matches <query>? */
successMsg = msg + 'exactly matches "' + query + '"';
failMsg = nomsg + 'exactly matches "' + query + '"';
tester.isExactArticle(query).then(
  makeBooleanResponseHandler(successMsg, failMsg),
  console.error
);

/* is there an article whose label regex matches <query>? */
successMsg = msg + 'regex matches "' + query + '"';
failMsg = nomsg + 'regex matches "' + query + '"';
tester.isExactArticle(query).then(
  makeBooleanResponseHandler(successMsg, failMsg),
  console.error
);

/* is there an article whose label contains the words in <query>
   and which is about one of the "useful" types of thing? */
successMsg = msg + 'contains the words in "' + query +
             '" and is about a "useful" type of thing';
failMsg = nomsg + 'contains the words in "' + query +
          '" and is about a "useful" type of thing';
tester.isExactArticle(query).then(
  makeBooleanResponseHandler(successMsg, failMsg),
  console.error
);

/* count the number of types of article related to labels containing
   the words in <query> */
tester.selectArticleTypes(query).then(
  function (response) {
    var numTypes = response.body.results.bindings.length;

    console.log('TIME: ' + response.time + 'ms - RESULT: ' +
                '# article subjects relating to labels containing the ' +
                'words in "' + query + '" = ' + numTypes);
  },

  console.error
);

/* count the number articles related to labels containing
   the words in <query> */
tester.selectArticles(query).then(
  function (response) {
    var numArticles = response.body.results.bindings.length;

    console.log('TIME: ' + response.time + 'ms - RESULT: ' +
                '# articles relating to labels containing the ' +
                'words in "' + query + '" = ' + numArticles);
  },

  console.error
);

/* get all the stats in one hit */
tester.getDBpediaStats(query).then(
  function (response) {
    console.log('SUMMARY:\n' + JSON.stringify(response, null, 2));
  },

  function (err) {
    console.error(err.message);
    console.error(err.stack);
  }
);
