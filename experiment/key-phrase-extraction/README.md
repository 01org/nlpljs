# SPARQL queries against the dbpedia API to improve key phrase extraction

*Elliot Smith, 2015-01-09*

## Introduction

The idea is to send extracted key phrases to
<a href="http://dbpedia.org/sparql">dbpedia's SPARQL endpoint</a>,
and only use key phrases which satisfy some query/queries against that
endpoint. (SPARQL is a query language for RDF stores, similar to SQL.)

My initial thought was to accept a key phrase if dbpedia contains any
"thing" with a label containing that key phrase, which also has a
related Wikipedia page ID. (The label for a thing in dbpedia is a
general-purpose human-readable name for that thing.) However, it
later occurred to me that we could go beyond that and use the structure
of the dbpedia data to help us rank results (see the penultimate section).

## SPARQL experiments

I tried a variety of SPARQL queries to find the one which is fastest.
The principle is the same for all the queries: check whether a key
phrase is the label for a thing in dbpedia (and, by association,
relates to an article in Wikipedia).

I've included each version of the query I tried to give an idea of how it
evolved.

### Find concepts with one or more specified labels (exact match)

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?thing
WHERE {
  ?thing rdfs:label ?label .
  FILTER (?label = 'Battle of Hastings'@en || ?label = 'Battle of Fulford'@en) .
}
</pre>

This is fast, but requires exact matches and is language-specific (the '@en' part).

### Find things with label matching a regex (case insensitive)

This is a lot slower than the exact match above, but better because it is
not case sensitive and you don't have to specify the language.

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?thing
WHERE {
  ?thing rdfs:label ?label .
  FILTER (regex(?label, '^Battle of Hastings', 'i')) .
}
</pre>

This returns a single result:

<pre>
{
  "head":{
    "link":[

    ],
    "vars":[
      "thing"
    ]
  },
  "results":{
    "distinct":false,
    "ordered":true,
    "bindings":[
      {
        "thing":{
          "type":"uri",
          "value":"http://dbpedia.org/resource/Battle_of_Hastings"
        }
      }
    ]
  }
}
</pre>

Which is linked to
http://dbpedia.org/page/Battle_of_Hastings

### Find articles with label matching a regex

This is the same as the previous query, but also tests whether the
thing retrieved has an associated Wikipedia abstract (and a page by implication).

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT DISTINCT ?thing
WHERE {
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:abstract ?abstract .
  FILTER (regex(?label, '^battle of hastings', 'i')) .
}
</pre>

This is just as slow as the version without the ?abstract clause.

### Ask whether there is an article with a label matching the regex

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:abstract ?abstract .
  FILTER (regex(?label, '^battle of hastings', 'i')) .
}
</pre>

This is slightly faster, but still pretty slow. It does have the
advantage of returning a simple true or false, so works well as
an existence test.

### Ask whether there is an article with label matching key phrase

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:abstract ?abstract .
  FILTER (contains(?label, 'Battle of Hastings')) .
}
</pre>

This seems faster than the regex version, but is case sensitive, so
probably less useful.

### Ask whether there is an article with a wiki page ID

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:wikiPageID ?id .
  FILTER (contains(?label, 'Battle of Hastings')) .
}
</pre>

Seems slightly faster than the version which asks for an ID, but
still pretty slow; but it still takes 10 seconds to return.

### Ask whether there is a article labelled by the key phrase using faster search

**This is much faster!!! (fast enough).**

I figured out the correct query from <a href="http://stackoverflow.com/questions/13572915/how-to-make-my-sparql-query-with-regex-faster">this page</a> and by viewing the SPARQL
for a query against the <a href="http://dbpedia.org/fct/">dbpedia
facets service</a>.

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:wikiPageID ?id .
  ?label bif:contains '(Battle AND of AND Hastings)' .
}
</pre>

This returns within 225ms, which is definitely fast enough.

NB bif: is a special prefix which is internal to dbpedia and
doesn't have a proper namespace URI, which is why is why the namespace
is not defined in the query.

## First pass at an algorithm for improving key phrase selection using dbpedia

Given the above queries, here is an initial algorithm for using dbpedia
data to improve key phrase evaluation.

For each key phrase:

<ol>

<li>Give the key phrase a score of 1.</li>

<li>
Do an "ASK" query to determine whether there are
any dbpedia "things" related to the key phrase:

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:wikiPageID ?id .
  ?label bif:contains '(Battle AND of AND Hastings)' .
}
</pre>

Note that this returns true/false. Any key phrase which returns true
gets a score of 2.
</li>

<li>Do a second query with the key phrase to find a "thing" with a label
exactly the same as the key phrase:

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
ASK
{
  ?thing rdfs:label ?label .
  ?thing dbpedia-owl:wikiPageID ?id .
  FILTER (?label = 'Battle of Hastings'@en) .
}
</pre>

NB this is language specific, but very fast. If there is something with
the exact label, we assume that this is evidence that the key phrase
references something important (it has its own dedicated Wikipedia
article). Give the key phrase a score of 3.</li>

<li>Sort key phrases according to their score: any key phrases with
a dedicated article will be at the top, any key phrases with a
related article will be next, then finally any key phrases without
dbpedia entries.</li>

</ol>

Instead of giving scores just for relationships between key phrases
and dbpedia, we could use them in tandem with the existing page rank
scores: perhaps the dbpedia scores act as multipliers on the page rank
scores.

In this context, the slider also changes its meaning: rather than only
selecting different slices of the keywords (scored only by page rank),
we could select keywords based on their page rank combined with their
evidential "weight" from dbpedia.

## Possible improvements/alternatives to this algorithm

These are some suggestions for further refinements which could give
us more information about the value of a key phrase, by doing
additional queries against dbpedia and making use of type information.

### Score according to the number of articles associated with the key phrase

It is possible to do more complex queries, such as finding all
of the articles relating to a key phrase. Here's an example query to get all
the things whose label contains "Hollywood Boulevard":

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT DISTINCT ?thing
{
  ?thing rdfs:label ?label .
  ?label bif:contains '(Hollywood AND Boulevard)' .
  ?thing dbpedia-owl:wikiPageID ?id .
}
</pre>

This information could be used to determine how "vague" a key phrase is:
for example, a key phrase relating to many Wikipedia articles is not
very discriminating, and less likely to produce useful related content
(there's a higher chance you'll get something irrelevant).

We could then change how we weight key phrases depending on the "slider":
if we have a "narrow" focus, we give more weight to key phrases which
have fewer related Wikipedia pages. The assumption here is that key phrases
with many results are not as "discriminating", as they relate to many
articles; so their related content should not be shown when the
focus is narrow. But, if we have a "wide" focus, we also include key
phrases with many related Wikipedia pages.

The problem with doing this, though, is that a query which
SELECTs full results can occasionally be very, very slow.

### Score according to the number of types of thing associated with a key phrase

One possible alternative to finding the number of associated
articles might be to count the number of different types
associated with the key phrase:

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT DISTINCT ?type
WHERE
{
  ?thing rdfs:label ?label .
  ?label bif:contains '(Hastings)' .
  ?thing dbpedia-owl:wikiPageID ?id .
  ?thing rdf:type ?type .
}
</pre>

A label which is associated with things of many different types could
be considered more "vague" than a label associated with things of a few
types. As a concrete example, the key phrase "Hastings" is associated with
1542 types of thing; by contrast, the key phrase "Harald Hardrada" is
associated with 33 types of thing. This provides evidence that "Harald Hardrada"
is a "better" key phrase, as it is more discriminating then "Hastings"
(it is inherently less ambiguous, as it relates to fewer Wikipedia
pages).

But, again, shifting the slider may change what "better" means: when the
slider is set to "Wander", we prefer key phrases with more type
associations over those with fewer; when set to "Focus", we prefer
key phrases with fewer type associations over those with many.

This type of query is still quite slow, though (c. 5 seconds), so
I'm not sure how practical this is.

As an aside, the number of distinct types in dbpedia is 10,000 or more.
This query returns this number of results, but there are presumably more:

<pre>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT DISTINCT ?type
WHERE
{
  ?thing rdf:type ?type .
  ?thing dbpedia-owl:wikiPageID ?id .
}
</pre>

### Score key phrases more highly if they relate to "useful" types of entity

One more focused approach could be to run a query to find out whether
a key phrase references a location, person, battle etc. (a kind of rough
and ready named entity recognition); then give extra weight to any
key phrases which reference the kinds of "entities" we're interested in.
For example, here's a query to find whether there are any events, places,
organisations or people with a label containing "Spalding":

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
ASK
{
  ?thing rdfs:label ?label .
  ?label bif:contains '(Spalding)' .
  ?thing dbpedia-owl:wikiPageID ?id .
  ?thing rdf:type ?t .
  FILTER (?t = dbpedia-owl:Place ||
          ?t = dbpedia-owl:Event ||
          ?t = foaf:Person ||
          ?t = dbpedia-owl:Organisation) .
}
</pre>

If we tried the same query with a vague keyword like "rest splits", which
doesn't refer to any meaningful entity, we would get a negative result.

We could add to the filter to include other types of thing we think
people might want to see (buildings, battles, vehicles, products,
diseases, gods, belief systems, LEGO castle models?).
<a href="http://nlp.cs.nyu.edu/ene/version7_1_0Beng.html">This article</a>
gives a list of the types of entity which might be considered.

The advantage of this approach is that ASK queries are fast, and
especially fast if you have a tight filter as we have here (&lt; 200ms).

Given that this query is fast, another way of approaching the "how many
types?" query might be to do a series of ASK queries instead, each
asking whether the key phrase labels a thing or a particular type, e.g.
here's a query asking whether "Spalding" relates to any thing which
is a place:

<pre>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
ASK
{
  ?thing rdfs:label ?label .
  ?label bif:contains '(Spalding)' .
  ?thing dbpedia-owl:wikiPageID ?id .
  ?thing rdf:type dbpedia-owl:Place .
}
</pre>

It could be faster to do 4+ queries like this, one for each type of
thing we think is useful, rather than the slower query for *all* types
of the previous section. Then, as in the previous section, treat key
phrases which relate to more types of thing as being more "vague" than
key phrases which relate to fewer types of thing.

## Proof of concept

This directory contains some scripts which enable testing a key phrase
against dbpedia, which tries the following queries for a key phrase
passed to it:

* Does the key phrase occur in the label of any "thing"?
* Does the key phrase occur as the exact English label of a "thing"?
* Does a regular expression formed from the key phrase match the label
of any "thing" which is a place, person, organisation or event?
* How many types of thing are associated with the key phrase?
* Does a regular expression formed from the key phrase match the label
of any "thing"? (NOTE: this query sometimes times out, which adds further
evidence that it's not practical to use regex queries against
dbpedia)

To test it, you'll need nodejs and `npm install` to install
the dependencies. Then run a query like:

    ./dbpedia-ask.sh "Battle of Fulford"

Note that case sensitivity is important: testing "Battle of Hastings"
will find articles containing that string, as well as an article with
that exact string as its label. However, "battle of hastings" will find
some things on dbpedia which contain that string, but will not find an
article with that exact string as its label (labels are case sensitive).

The regex match will work in situations like this, where the exact
string match fails; however, it can be up to 40-80 times slower (126ms
for exact string vs. 4-9s for regex match) and sometimes times out
or fails altogether. Though I think dbpedia has a query cache which
makes this difficult to measure: after you've run a query once, the
cache is already warmed up and its will return more quickly.

The code in keyphrase-dbpedia-tester.js is reasonably close to the
implementation we would need to do to query dbpedia from Content Push.
