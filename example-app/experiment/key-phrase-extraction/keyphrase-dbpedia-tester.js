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
   "Battle AND Hastings", suitable for use in the bif:contains
   clause of a query to be passed to the dbpedia API;
   NB we have to remove "and" from the strings to replace
   contiguous sequences of whitespace to make query formation work */
var makeBifContainsString = function (keyphrase) {
  var normalised = keyphrase.toLowerCase()
                            .replace(/and/g, ' ');
  return cleanWhitespace(normalised).replace(/ /g, ' AND ');
};

/* ASK whether a keyphrase has a related article */
var askBifContainsLabelSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'ASK {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
               '  ?label bif:contains "(' + expression + ')" .\n' +
               '}';

  return sparql;
};

/* ASK whether an article exists with the exact keyphrase
   as its label; assumes that keyphrase is lowercased and in English
   for now, as this is what our NLP engine supplies */
var askExactLabelSparql = function (keyphrase) {
  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'ASK {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
               '  FILTER (\n' +
               '    ?label = "' + cleanWhitespace(keyphrase) + '"@en\n' +
               '  ) .\n' +
               '}';

  return sparql;
};

/* ASK whether an article exists, matching by regex
  (case insensitive) */
var askRegexLabelSparql = function (keyphrase) {
  var expression = cleanWhitespace(keyphrase.toLowerCase());

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'ASK {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
               '  FILTER (\n' +
               '    regex(?label, "^' + expression + '$", "i")\n' +
               '  ) .\n' +
               '}';

  return sparql;
};

/* ask whether an article about a place, event, person or organisation
   has a label containing the keyphrase */
var askUsefulArticleSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n' +
               'ASK {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?label bif:contains "(' + expression + ')" .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
               '  ?thing rdf:type ?t .\n' +
               '  FILTER (\n' +
               '    ?t = dbpedia-owl:Place ||\n' +
               '    ?t = dbpedia-owl:Event ||\n' +
               '    ?t = foaf:Person ||\n' +
               '    ?t = dbpedia-owl:Organisation\n' +
               '  ) .\n' +
               '}';

  return sparql;
};

/* select the distinct types of thing whose label contains the words
   in the keyphrase; this returns the types themselves */
var selectArticleTypesSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'SELECT DISTINCT ?type WHERE {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?label bif:contains "(' + expression + ')" .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
               '  ?thing rdf:type ?type .\n' +
               '}\n';

  return sparql;
};

/* select all the articles whose label contains the words in keyphrase;
   this returns the articles */
var selectArticlesSparql = function (keyphrase) {
  var expression = makeBifContainsString(keyphrase);

  var sparql = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\n' +
               'SELECT DISTINCT ?thing WHERE {\n' +
               '  ?thing rdfs:label ?label .\n' +
               '  ?label bif:contains "(' + expression + ')" .\n' +
               '  ?thing dbpedia-owl:wikiPageID ?id .\n' +
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

    request.get({
      url: url,
      timeout: 30000
    },

    function (error, response, body) {
      var end = (new Date()).getTime();
      var ms = end - start;

      if (!error) {
        if (response.statusCode == 200) {
          body = JSON.parse(body);
        } else {
          body = null;
        }

        resolve({
          time: ms,
          query: query,
          sparql: sparql,
          url: url,
          responseCode: response.statusCode,
          body: body
        });
      } else {
        reject(new Error('general error fetching URL "' + url + '"\n' +
                         JSON.stringify(error)));
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

var QUERIES = {
  /* is there an article whose label contains the words in <query>? */
  isAnyArticle: function (query) {
    var sparql = askBifContainsLabelSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? results.body.boolean : false);
    });
  },

  /* is there an article whose label exactly matches <query>? NB
     this is case sensitive and language specific, and the whole label
     must match <query> */
  isExactArticle: function (query) {
    var sparql = askExactLabelSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? results.body.boolean : false);
    });
  },

  /* is there an article whose label regex matches <query>? the regex
     used is /^query$/ */
  isRegexArticle: function (query) {
    var sparql = askRegexLabelSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? results.body.boolean : false);
    });
  },

  /* is there a useful thing (places, people, organisation etc.)
     which has an article related to the label? */
  isUsefulArticle: function (query) {
    var sparql = askUsefulArticleSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? results.body.boolean : false);
    });
  },

  /* get types which are associated with things which
     have labels containing the text "query" */
  selectArticleTypes: function (query) {
    var sparql = selectArticleTypesSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? countBindings(results) : 0);
    });
  },

  /* get things whose label contains the words in query and which
     have a related Wikipedia article */
  selectArticles: function (query) {
    var sparql = selectArticlesSparql(query);
    return doRequest(query, sparql).then(function (results) {
      return Promise.resolve(results.body ? countBindings(results) : 0);
    });
  },

  /* CRUDE FIRST ATTEMPT
     get all the dbpedia info relating to query, by calling (nearly) all of
     the API methods in tandem and combining their results;
     note that if a request times out, any booleans are set to false
     and any counts to 0, so this is a primitive approach at best;
     queryObj contains <keyword> (full original phrase) and
     <keywordNoStop> (phrase without stop words);
     queriesToRun is an array containing one or more of the following query names:
       isAnyArticle
       isExactArticle
       isUsefulArticle
       selectArticleTypes
       selectArticles
   */
  getDBpediaStats: function (queryObj, queriesToRun) {
    var start = (new Date()).getTime();

    var promises = [];
    var queryName;

    for (var i = 0; i < queriesToRun.length; i++) {
      queryName = queriesToRun[i];

      /* we only use the version of the keyword with its stop words
         for the exact label search */
      if (queryName === 'isExactArticle') {
        promises.push(QUERIES[queryName](queryObj.keyword));
      } else {
        promises.push(QUERIES[queryName](queryObj.keywordNoStop));
      }
    }

    /* set some default "no info" values on the response */
    var response = {
      time: 0,
      retrieved: false,
      keyword: queryObj.keyword,
      keywordNoStop: queryObj.keywordNoStop,
      info: {
        pagerank: queryObj.pagerank,
        isExactArticle: false,
        isAnyArticle: false,
        isUsefulArticle: false,
        numArticleTypes: 0,
        numArticles: 0
      }
    };

    return Promise.all(promises)
    .then(
      function (results) {
        response.retrieved = true;

        /* overwrite the info properties with real values derived
           from the response */
        for (var j = 0; j < queriesToRun.length; j++) {
          response.info[queriesToRun[j]] = results[j];
        }

        return Promise.resolve(response);
      },

      function (err) {
        response.errorText = 'could not get dbpedia data for query of type ' +
                             queryName;

        return Promise.resolve(response);
      }
    )
    .then(function (response) {
      response.time = (new Date()).getTime() - start;
      return Promise.resolve(response);
    })
    .catch(function (err) {
      console.error(err.message);
      console.error(err.stack);
      Promise.reject(err);
    });
  }
};

module.exports = QUERIES;
