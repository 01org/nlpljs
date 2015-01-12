#!/usr/bin/env node
// ask dbpedia about a key phrase
// usage: ./dbpedia-ask.sh "key phrase"

var tester = require('./keyphrase-dbpedia-tester');
var query = process.argv[2];

// is key phrase in the label of any thing on dbpedia (case insensitive)?
tester.checkForThing(query);

// does the key phrase exactly match the label of a thing on dbpedia
// (case sensitive)?
tester.checkForExactThing(query);

// does the key phrase regex match the label of a thing on dbpedia?
// regex used is '^' + <key phrase> + '$'
tester.checkForRegexThing(query);

// does the key phrase match the label of an entity on dbpedia?
tester.checkForEntity(query);

// how many types are labels containing the query associated with?
// (more associations => more vague query)
tester.countTypesForQuery(query);

// how many types are then in dbpedia?
tester.countTypes();
