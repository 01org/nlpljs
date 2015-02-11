# libnlp

libnlp is a library for natural language processing. It is implemented in
JavaScript and can run in a browser or in a standalone JavaScript engine
(e.g. [node](http://nodejs.org/)).

It has the following features:

* A fast tokenizer (not quite as fast as
[naturaljs](https://github.com/NaturalNode/natural), but not far behind).

* Support for [part of speech tagging](http://en.wikipedia.org/wiki/Part-of-speech_tagging).
Our library is trained for this task using
[MASC](http://www.anc.org/data/masc/) (Manually Annotated Sub-Corpus),
a completely free and open corpus for NLP applications.

* Support for extraction of key phrases from text. This uses a quick
and dirty noun phrase identifier which performs ad-hoc (but fast and
reasonably accurate) noun phrase chunking.

* Scoring key phrases with respect to an origin text using the
[TextRank](http://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf)
algorithm.

Note that libnlp has no multi-lingual capabilities: the part of speech
tagger is only capable of tagging English text.

## Installation

libnlp has no runtime dependencies. However, to run the tests and benchmarks,
you will need to install a few packages:

    npm install

## Usage

libnlp requires that you use an AMD module loader like
[requirejs](http://requirejs.org/). Then you can use it from your
JavaScript files as per usual:

    define(['libnlp'], function (libnlp) {
      // ... use libnlp ...
    });

`test/functional/simple.html` gives an example of how to use
libnlp in this way.

It would be possible to use libnlp without requirejs, though this would
require that the language model file be loaded by an alternative mechanism
(currently, we use the
[requirejs text plugin](http://requirejs.org/docs/api.html#text) to do
this).

To use in other JavaScript platforms (e.g. nodejs):

    var libnlp = require('libnlp');

See the **API** section for details of the available features (the
API is the same regardless of platform).

## API

*   libnlp.tokenizer.tokenize(text)

    Returns an array of tokens (words) in the input string `text`.

    Example:

    ```
    > libnlp.tokenizer.tokenize('hello world its a new day')
    [ 'hello', 'world', 'its', 'a', 'new', 'day' ]
    ```

*   libnlp.postagger.tag(text)

    Extract part of speech tagging for the string `text`.

    Returns an array of token objects with associated part of speech
    tags. The tags returned are from the
    [Penn Treebank tagset](http://www.cis.upenn.edu/~treebank/),
    extended with capitalization and end of sentence data.

    Example:

    ```
    > libnlp.postagger.tag('hello world it is a new day')
    [ { token: 'hello', tag: 'UH' },
      { token: 'world', tag: 'NN' },
      { token: 'it', tag: 'PRP' },
      { token: 'is', tag: 'VBZ' },
      { token: 'a', tag: 'DT' },
      { token: 'new', tag: 'JJ' },
      { token: 'day', tag: 'NN' } ]
    ```

*   libnlp.keyphrase_extractor.extractFrom(text)

    Extract key phrases from the string `text`.

    Returns an object with `keywords` and `scores` properties
    representing the extracted key phrases and their corresponding
    [TextRank](http://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf)
    scores respectively. Those properties are arrays with equivalent
    orderings: the key phrase at index 0 in `keywords` has the score
    at index 0 in `scores` etc.

    Example:

    ```
    > var text = 'what a beautiful day to stroll in the verdant countryside';
    > libnlp.keyphrase_extractor.extractFrom(text)
    { keywords: [ 'beautiful day', 'verdant countryside' ],
      scores: [ 1, 1 ] }
    ```

## Running the tests

libnlp has a very basic unit test suite. To run it, do:

    grunt test

Test coverage reports are also available with:

    grunt cov

## Scripts

Although libnlp is intended to be used as a library, the `scripts/`
directory contains some command line programs which demonstrate how
to use it.

    # extract key phrases from an input
    echo "The Battle of Hastings was in 1066." | ./scripts/extract-keyphrases.sh
    cat <file> | ./scripts/extract-keyphrases.sh

## Example application: Content Push

The `example-app/` directory contains an application called Content
Push. This application was the original impetous behind the
creation of libnlp. Although no longer maintained, Content Push is included
here to demonstrate the potential of libnlp.

Content Push is a browser extension which acts as a companion for
Google Docs, living in a panel alongside your documents.
It watches the text in an open document, looking for key phrases.
When it finds any, it performs automatic searches against Wikipedia
and your Google Drive with those key phrases, to retrieve related
content. If any content is found, it is shown as a thumbnail in the
panel; pressing on the panel opens a detail window with more data about
the search result and a link to its origin.

### Content Push: build and install

To build and run the application, you will need the following
pre-requisites:

* A Google Chrome browser
* A Google account with access to Google Docs
* A standalone JavaScript platform (e.g. nodejs) with npm
* [bower](http://bower.io/) installed

Once the pre-requisites are in place, perform the following
steps to build Content Push (from the command line):

    cd example-app
    npm install
    bower install
    grunt dist

This builds the application in the `example-app/dist` directory. You
can then install it in your Chrome browser as an extension:

1.  Open Chrome.
2.  In the address bar, type `chrome://extensions`. This will bring
up the extension management page.
3.  Press the *Load unpacked extension...* button. This brings up
a file dialog box.
4.  Browse to the `example-app/dist` directory then press *Open*.
Content Push should now be listed on the extensions page.
5.  Once installed, go to https://drive.google.com/ and open a
Google Docs document. The Content Push panel should open to the right
of the document.

Note that you may be prompted to allow Content Push access to your
Google Drive (via OAuth authentication). This is to enable it to
search your personal files for related content.

### Content Push: tests

To run the unit tests for the example-app, do:

    grunt test

There are also some manual functional tests for the application in
`example-app/test/functional/index.html`. Open this page in a Chrome
browser to run them.
