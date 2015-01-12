// functions to make requests to dbpedia for a given
// key phrase to determine whether dbpedia contains related resources
// for that key phrase (a related resource is defined as a thing
// on dbpedia which has a Wikipedia article ID and a label which
// matches the key phrase in some way)
var request = require('request');

var BASE_URL = 'http://dbpedia.org/sparql';
var FORMAT = encodeURIComponent('application/sparql-results+json');

var cleanWhitespace = function (keyphrase) {
  return keyphrase.replace(/ {2,}/g, ' ')
                  .replace(/^ /, '')
                  .replace(/ $/, '');
};

// convert a keyphrase like "Battle of Hastings" to
// "Battle AND of AND Hastings", suitable for use in the bif:contains
// clause of a query to be passed to the dbpedia API;
// NB we have to remove "and" from the strings to and replace
// contiguous sequences of whitespace to make query formation work
var makeBifContainsString = function (keyphrase) {
  var normalised = keyphrase.toLowerCase()
                            .replace(/and/g, ' ');
  return cleanWhitespace(normalised).replace(/ /g, ' AND ');
};

// ASK dbpedia whether a key phrase has a related article
var makeQueryForLabel = function (keyphrase) {
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

// ASK dbpedia whether an article exists with the exact key phrase
// as its label; assumes that keyphrase is lower cased and in English
var makeQueryForExactLabel = function (keyphrase) {
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

// ASK dbpedia whether an article exists, matching by regex
// (case insensitive)
var makeQueryForLabelRegex = function (keyphrase) {
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

var makeQueryForEntity = function (keyphrase) {
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

var makeQueryForTypes = function (keyphrase) {
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

var makeUrl = function (sparql) {
  return BASE_URL + '?format=' + FORMAT + '&query=' + encodeURIComponent(sparql);
};

var makeBooleanResponseHandler = function (successMsg, failMsg) {
  return function (timeMsg, body) {
    var result = JSON.parse(body).boolean;
    if (result) {
      console.log(timeMsg + 'SUCCESS - ' + successMsg);
    } else {
      console.log(timeMsg + 'FAIL    - ' + failMsg);
    }
  };
};

var doRequest = function (url, responseCb) {
  var start = (new Date()).getTime();

  request(url, function (error, response, body) {
    var end = (new Date()).getTime();
    var ms = end - start;
    if (ms < 10000) {
      ms = ' ' + ms;
    }
    if (ms < 1000) {
      ms = ' ' + ms;
    }
    var timeMsg = 'TIME: ' + ms + 'ms; ';

    if (!error && response.statusCode == 200) {
      responseCb(timeMsg, body);
    } else {
      console.error('error fetching URL');
      console.error(url);
    }
  });
};

var checkForThing = function (query) {
  var sparql = makeQueryForLabel(query);
  var url = makeUrl(sparql);
  var successMsg = 'CONTAINS LABEL: "' + query +
                   '" is in the label of a thing on dbpedia';
  var failMsg = 'CONTAINS LABEL: keyphrase "' + query +
                '" IS NOT in the label of a thing on dbpedia';
  doRequest(url, makeBooleanResponseHandler(successMsg, failMsg));
};

var checkForExactThing = function (query) {
  var sparql = makeQueryForExactLabel(query);
  var url = makeUrl(sparql);
  var successMsg = '   EXACT LABEL: "' + query +
                    '" has a thing with the exact label on dbpedia';
  var failMsg = '   EXACT LABEL: "' + query +
                '" DOES NOT have a thing with the exact label on dbpedia';
  doRequest(url, makeBooleanResponseHandler(successMsg, failMsg));
};

var checkForRegexThing = function (query) {
  var sparql = makeQueryForLabelRegex(query);
  var url = makeUrl(sparql);
  var successMsg = '   REGEX LABEL: "' + query +
                   '" matches the label of a thing on dbpedia';
  var failMsg = '   REGEX LABEL: "' + query +
                '" DOES NOT match the label of a thing on dbpedia';
  doRequest(url, makeBooleanResponseHandler(successMsg, failMsg));
};

var checkForEntity = function (query) {
  var sparql = makeQueryForEntity(query);
  var url = makeUrl(sparql);
  var successMsg = '  ENTITY LABEL: "' + query +
                   '" labels a person, place, organisation or event on dbpedia';
  var failMsg = '  ENTITY LABEL: "' + query +
                '" DOES NOT label a person, place, organisation or event on dbpedia';
  doRequest(url, makeBooleanResponseHandler(successMsg, failMsg));
};

// count the number of types which are associated with things which
// have labels containing the text "query"
var countTypesForQuery = function (query) {
  var sparql = makeQueryForTypes(query);
  var url = makeUrl(sparql);

  var responseCb = function (timeMsg, body) {
    var numTypes = JSON.parse(body).results.bindings.length;
    console.log(timeMsg + '# ASSOCIATED TYPES: "' + query +
                '" occurs in things associated with ' + numTypes + ' types');
  };

  doRequest(url, responseCb);
};

// count the number of types in the whole of dbpedia; note that this
// always returns 10000, as there are 10000+ types
var countTypes = function () {
  var sparql = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
               'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>' +
               'SELECT DISTINCT ?type WHERE {' +
               '  ?thing rdf:type ?type . ' +
               '  ?thing dbpedia-owl:wikiPageID ?id .' +
               '}';

  var url = makeUrl(sparql);

  var responseCb = function (timeMsg, body) {
    var numTypes = JSON.parse(body).results.bindings.length;
    console.log(timeMsg + '# TYPES IN DBPEDIA: ' + numTypes);
  };

  doRequest(url, responseCb);
};

module.exports = {
  checkForThing: checkForThing,
  checkForExactThing: checkForExactThing,
  checkForRegexThing: checkForRegexThing,
  checkForEntity: checkForEntity,
  countTypesForQuery: countTypesForQuery,
  countTypes: countTypes
};
