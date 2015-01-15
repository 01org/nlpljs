/* functions to make requests to dbpedia for a given
   keyphrase to determine whether dbpedia contains related resources
   for that keyphrase (a related resource is defined as a thing
   on dbpedia which has a Wikipedia article ID and a label which
   matches the keyphrase in some way)

   note that in most cases we use bif:contains to check whether the
   words in the keyphrase occur in a dbpedia label: this is far, far
   faster than doing regex or contains queries the SPARQL standard
   way, though it is less accurate, e.g.

     "Battle of Hastings" bif:contains "Battle other than the Battle of Hastings"

   is true. */
var request = require('request');

var BASE_URL = 'http://dbpedia.org/sparql';
var FORMAT = encodeURIComponent('application/sparql-results+json');

var cleanWhitespace = function (keyphrase) {
  return keyphrase.replace(/ {2,}/g, ' ')
                  .replace(/^ /, '')
                  .replace(/ $/, '');
};

/* convert a keyphrase like "Battle of Hastings" to
   "Battle AND of AND Hastings", suitable for use in the bif:contains
   clause of a query to be passed to the dbpedia API;
   NB we have to remove "and" from the strings to and replace
   contiguous sequences of whitespace to make query formation work */
var makeBifContainsString = function (keyphrase) {
  var normalised = keyphrase.toLowerCase()
                            .replace(/and/g, ' ');
  return cleanWhitespace(normalised).replace(/ /g, ' AND ');
};

/* ASK whether a keyphrase has a related article */
var askBifContainsLabelSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'ASK {' +
               '  ?thing rdfs:label ?label .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '  ?label bif:contains "(' + expression + ')" .' +
               '}';

  return sparql;
};

/* ASK whether an article exists with the exact keyphrase
   as its label; assumes that keyphrase is lowercased and in English
   for now, as this is what our NLP engine supplies */
var askExactLabelSparql = function (keyphrase) {
  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'ASK {' +
               '  ?thing rdfs:label ?label .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '  FILTER (' +
               '    ?label = "' + cleanWhitespace(keyphrase) + '"@en' +
               '  ) .' +
               '}';

  return sparql;
};

/* ASK whether an article exists, matching by regex
  (case insensitive) */
var askRegexLabelSparql = function (keyphrase) {
  var expression = cleanWhitespace(keyphrase.toLowerCase());

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'ASK {' +
               '  ?thing rdfs:label ?label .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '  FILTER (' +
               '    regex(?label, "^' + expression + '$", "i")' +
               '  ) .' +
               '}';

  return sparql;
};

/* ask whether an article about a place, event, person or organisation
   has a label containing the keyphrase */
var askUsefulArticleSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'PREFIX foaf: <http://xmlns.com/foaf/0.1/>' +
               'ASK {' +
               '  ?thing rdfs:label ?label .' +
               '  ?label bif:contains "(' + expression + ')" .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '  ?thing rdf:type ?t .' +
               '  FILTER ( ' +
               '    ?t = dbpedia-owl:Place ||' +
               '    ?t = dbpedia-owl:Event ||' +
               '    ?t = foaf:Person ||' +
               '    ?t = dbpedia-owl:Organisation' +
               '  ) .' +
               '}';

  return sparql;
};

/* select the distinct types of thing whose label contains the words
   in the keyphrase; this returns the types themselves */
var selectArticleTypesSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'SELECT DISTINCT ?type WHERE {' +
               '  ?thing rdfs:label ?label .' +
               '  ?label bif:contains "(' + expression + ')" .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '  ?thing rdf:type ?type .' +
               '}';

  return sparql;
};

/* select all the articles whose label contains the words in keyphrase;
   this returns the articles */
var selectArticlesSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'SELECT DISTINCT ?thing WHERE {' +
               '  ?thing rdfs:label ?label .' +
               '  ?label bif:contains "(' + expression + ')" .' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '}';

  return sparql;
};

var makeUrl = function (sparql) {
  return BASE_URL + '?format=' + FORMAT + '&query=' + encodeURIComponent(sparql);
};

/* returns a promise which resolves to the response or
   rejects with an error; the response has the format
   { time: <time in ms>, body: <response body> }
   the time is there for the purpose of benchmarking
   and represents the time between the start of the request
   and the time when the response was received */
var doRequest = function (query, sparql) {
  return new Promise(function (resolve, reject) {
    var url = makeUrl(sparql);
    var start = (new Date()).getTime();

    request(url, function (error, response, body) {
      var end = (new Date()).getTime();
      var ms = end - start;

      if (!error && response.statusCode == 200) {
        resolve({
          time: ms,
          query: query,
          sparql: sparql,
          url: url,
          body: JSON.parse(body)
        });
      } else {
        reject(new Error('error fetching URL "' + url + '"\n' +
                         JSON.stringify(response)));
      }
    });
  });
};

/* count the number of bindings in a SPARQL response and return the
   result */
var countBindings = function (response) {
  return response.body.results.bindings.length;
};

/* PUBLIC API FUNCTIONS */

/* is there an article whose label contains the words in <query>? */
var isAnyArticle = function (query) {
  var sparql = askBifContainsLabelSparql(query);
  return doRequest(query, sparql);
};

/* is there an article whose label exactly matches <query>? NB
   this is case sensitive and language specific, and the whole label
   must match <query> */
var isExactArticle = function (query) {
  var sparql = askExactLabelSparql(query);
  return doRequest(query, sparql);
};

/* is there an article whose label regex matches <query>? the regex
   used is /^query$/ */
var isRegexArticle = function (query) {
  var sparql = askRegexLabelSparql(query);
  return doRequest(query, sparql);
};

/* is there a useful thing (places, people, organisation etc.)
   which has an article related to the label? */
var isUsefulArticle = function (query) {
  var sparql = askUsefulArticleSparql(query);
  return doRequest(query, sparql);
};

/* get types which are associated with things which
   have labels containing the text "query" */
var selectArticleTypes = function (query) {
  var sparql = selectArticleTypesSparql(query);
  return doRequest(query, sparql);
};

/* get things whose label contains the words in query and which
   have a related Wikipedia article */
var selectArticles = function (query) {
  var sparql = selectArticlesSparql(query);
  return doRequest(query, sparql);
};

/* get all the dbpedia info relating to query, by calling all of
   the API methods in tandem and combining their results */
var getDBpediaStats = function (query) {
  var promises = [
    isAnyArticle(query),
    isExactArticle(query),
    isRegexArticle(query),
    isUsefulArticle(query),
    selectArticleTypes(query),
    selectArticles(query)
  ];

  return Promise.all(promises).then(
    function (
      results
    ) {
      var body = {
        isAnyArticle: results[0].body.boolean,
        isExactArticle: results[1].body.boolean,
        isRegexArticle: results[2].body.boolean,
        isUsefulArticle: results[3].body.boolean,
        numArticleTypes: countBindings(results[4]),
        numArticles: countBindings(results[5])
      };

      return Promise.resolve({body: body});
    }
  );
};

module.exports = {
  isAnyArticle: isAnyArticle,
  isExactArticle: isExactArticle,
  isRegexArticle: isRegexArticle,
  isUsefulArticle: isUsefulArticle,
  selectArticleTypes: selectArticleTypes,
  selectArticles: selectArticles,
  getDBpediaStats: getDBpediaStats
};
