# Working on Content Push

This is an orientation document for people wanting to work on Content Push (CP).

## Technology overview

CP is a web application designed to run on Chrome. It won't work in other browsers or as a hosted application in its current form.

[Polymer](https://www.polymer-project.org/) is used for the UI components.

[lodash](https://lodash.com/) is used for general utilities.

We use [requirejs](http://requirejs.com) in some places in the application (mainly to load the NLP engine), but we haven't used it consistently with our custom Polymer elements. We have tended to rely on exposing non-UI components via global properties on `window` (mainly because we weren't really sure how to use requirejs cleanly with Polymer).

[SparkMD5](https://github.com/satazor/SparkMD5) is used to construct Wikipedia image URLs (see http://commons.wikimedia.org/wiki/Commons:FAQ#What_are_the_strangely_named_components_in_file_paths.3F).

## Setting up for development

The developers used Linux for CP's development, but it should be possible to work on the application using other platforms which can run Google Chrome.

You're going to need [nodejs](http://nodejs.org/).

bower is used to install 3rd party client-side components (`npm install bower` first):

    bower install

npm is used to install 3rd party development and experimental tools:

    npm install

Though you don't need the development and experimental tools unless you want to work on the application (e.g. if you're just cloning it to run it as an extension).

## Application workflow

CP is partly a Chrome extension and partly a web application. The Chrome extension part uses a content script to "wrap" the web application part around a Google Docs document. The whole application lives in the `app` directory; paths in this section are given relative to `app`.

The user first installs CP. Then, when the user opens a Google Doc, CP triggers and bootstraps itself, as follows:

1.  User opens Google Doc.

2.  CP's manifest (`manifest.json`) specifies URL patterns which, when matched, will cause CP to start. As the user opened a Google Doc which matches those patterns, CP will automatically start itself.

3.  The `content_script/cs-rehost-page.js` content script runs. This constructs an HTML page in JavaScript; loads the application's main component `content_push/cp-main.html` into it; loads an object which holds global application data (`content_push/cp-globals.html`) into it; then sets some values on that global object which are only available to the extension, such as the application ID and original document URL. The `cp-main` component is then instantiated.

4.  Once `cp-main` is ready, it loads the original Google Doc document into a `cp-document` component (inside itself). The main UI for the application `cp-panel` loads to the right of the `cp-document`.

5.  `cp-document` loads the Google Doc into an iframe. It also sets up MutationObservers on the document, to detect when its text changes; watches scrolling on the document, to track which part of the text is currently visible; and initialises an NLP worker, ready to send text to the NLP engine.

    While `cp-document` is doing its work, the panel waits for the NLP engine to provide it with keywords.

6.  Once the document is fully loaded and scrolling pauses, the current context (text from the document visible in the browser viewport) is extracted by the `content_push/cp-scrollwatcher.html` component. The text is then forwarded to the NLP engine for processing.

    As the document and the viewport change, the scrollwatcher asks the NLP engine to parse the context for new keywords.

    The indeterminate progress bar in the app bar starts running when NLP starts parsing the context.

7.  The event pages for the application run in the extension context. These are located in the `event_page` directory. Their role is to handle various tasks in threads isolated from the main web application, to improve performance and make use of APIs not available to the web application. All communication between the web application and the event pages occurs via message passing along channels (see the [Google Chrome extensions docs](https://developer.chrome.com/extensions/event_pages)).

    The NLP engine runs as an event page. Other event pages are used to manage OAuth authentication (for the Google files search); to store the user's search source preferences; and to perform HTTP requests (for Google search).

    When a message is sent to the NLP engine asking that the context be parsed for keywords, the event pages are initialised.

8.  The NLP engine parses the context for keywords. The approach used is covered in the following section; broadly speaking, the most important noun phrases in the context are extracted and ranked. A `newkeywordinfo` event is then triggered with these keywords as the payload.

    When the NLP engine finishes parsing the context, the indeterminate progress bar in the app bar stops and is hidden.

9.  The panel listens for `newkeywordinfo` events. When they are received, the keywords are compared with the last active keyword list (e.g. from the last context). Any keywords which haven't been seen before become search query candidates; any keywords which have been seen before and already have associated results do not.

10. The set of active keywords (i.e. keywords associated with the current context) is reset to the array from the `newkeywordinfo` event. This resets the filter on the panel, so that only results for the top 5 keywords from the active keywords list are visible. Note that the keyword list is also modified by the slider position; so, if the slider is 50% of the way across, the results for the top 2 keywords are shown; if the slider is 100% of the way across, results for all 5 keywords are shown.

    The panel also uses the type from the panel menu for filtering (e.g. if "Images" or "Articles" is selected, only images or articles are shown, respectively).

    The filter is constructed in the `cp-display` element, which then applies it to a child `cp-layout` element responsible for arranging and displaying results.

11. The new keywords are used to perform searches against the configured search service (Google or Wikipedia). The `cp-display` element shows a progress message while the search requests are in flight.

12. Once all the searches return, the `cp-display` element hides its progress message and shows the tiles (according to the currently-active filter). `cp-layout` tracks which tiles are visible so that it only has to lay out tiles when they change (see the `cp-tile-cache` component).

    As the results are returned from the web (in JSON format), they are used to construct tiles to populate the right-hand panel. The type of tile created depends on the result type (image =&gt; `cp-tile-image`, file =&gt; `cp-tile-file`, article =&gt; `cp-tile-article`).

    The `cp-display` is responsible for creating the tiles, which are then appended to its child `cp-layout`. `cp-layout` shows a spinner while there are still tiles to be constructed and loaded; the spinner is hidden when all searches are complete and all expected tiles have loaded.

    Note that if an image fails to load for an image result, the image tile will not be shown (as there will be no content for the tile). However, if an image fails to load for an article result, the tile will still display, but without its thumbnail.

    If the request for an image hangs (e.g. network issues), it will timeout after a few seconds (set in `cp-constants.html`) so that the panel is not blocked.

    The thumbnails shown in the tiles are generated dynamically from the source image, via Google's thumbnailing service (part of Google+). See the `experiment/image-processing` directory for more details.

13. This cycle continues (e.g. user types or scrolls, context changes, NLP finds keywords from new context, searches are initiated from keywords, tiles are constructed from results).

    The user can also initiate a content fetch by scrolling to within a few pixels of the bottom of the panel. This will cause new results to be added to the panel as tiles. NB as many results as possible are fetched for each search, but only 5 are shown at a time for each keyword. When the user scrolls to look for more content, the next "page" of 5 results is fetched from the previous search, if available. If there aren't enough results, a new search for the keyword is initiated and results returned from that instead.

## The NLP algorithm

The code for the core of the NLP engine is in the `app/libnlp` directory.

The algorithm for extracting keywords is as follows:

1.  Tokenize the context to identify words and strip out non-words (punctuation etc.). The tokenizer is based on techniques discussed in this paper: http://www.coli.uni-saarland.de/~schulte/Teaching/ESSLLI-06/Referenzen/Tokenisation/schmid-hsk-tok.pdf

2.  Apply part of speech tagging to the tokens, assigning each its most likely part of speech (verb, noun, adjective etc.).

    The POS tagger uses a Hidden Markov Model (HMM) to encode the probability distributions derived from a training corpus (the current model has been trained on the Manually Annotated Sub-Corpus (MASC) http://www.anc.org/data/masc). The Viterbi algorithm is used to decode the HMM and derive the part of speech tags corresponding to any input text or token sequence. The training process assigns probabilities to each encountered part of speech unigram, bigram and trigram as well as calculating the probability of every token / part of speech tag combination. Additionally, suffixes which occur in less than 10% of the tokens in the training corpus are extracted and then the probability of each suffix / part of speech tag combination is derived. Capitalization information is also retained for improved accuracy. Finally the constructed HMM is stored in a JSON file. The POS tagger implementation is based on this paper: http://www.coli.uni-saarland.de/~thorsten/publications/Brants-ANLP00.pdf

3.  Extract keywords. This process is completely unsupervised and uses the TextRank model.

    After each token has been annotated with a part of speech tag, the keyword extractor constructs an undirected graph with the tokens as its vertices and the edges representing the co-occurrence relation between the words (i.e. the distance between their instances in the text). In the current implementation, two vertices are connected by an edge if their corresponding tokens are separated in the text by fewer than two other tokens. Additionally, a syntactic filter is applied to all potential graph vertices. This filter currently only allows nouns and adjectives to be used as vertices. Finally, the vertices are scored using TextRank and sorted by score. The top 1/3 of them are retained for post-processing and used to construct keyphrases (vertices are collapsed into a keyphrase if they occur next to each other in the text). More information about TextRank can be found in this paper: http://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf

## Highlighting

When you hover on a tile, you will see highlights on the keywords in the Google Doc which are associated with that tile's result. This is not done via the Google Apps Script API: we do it via a series of hacks on the document HTML (which we can access because we have another hack which loads the document into an iframe we control).

The code which does this is in `app/content_push/cp-keyword-highlighter.html`.

## Differences between Google and Wikipedia as search services

Either a Google Custom Search engine or Wikipedia's API can be used as search services. This is done by modifying the `SEARCH_SERVICE` global variable (see the README.md for details).

Note that Video and Quote search results are not available for either service, even though they are in the filter menu.

The differences between these services are as follows.

### Google Custom Search

1.  This uses a [Google Custom Search Engine](https://www.google.co.uk/cse/). The search engine ID belonging to this account is stored in the `app/content_push/cp-search-google.html` component as the `cx` property. To use your own Custom Search Engine, you'll need to modify this value. NB this component implements the Google search logic.

    Using Google Custom Search is free for up to 100 requests per day, but will be charged over that number. It can be administered using the [Google Developers Console](https://console.developers.google.com/).

2.  Searching against Google CSE will use the `event_page/ep-http.js` event page to send the requests over HTTP.

3.  The "Edit sources" option will be enabled in the panel menu. The user can specify search sources to use, and separate image and article searches will be carried out for each source. The search source data is stored in the user's `chrome.storage`, and should be available cross-device.

### Wikipedia search

1.  This uses the [Wikimedia commons API](https://commons.wikimedia.org/w/api.php) to perform image searches, and the [Wikipedia API](https://en.wikipedia.org/w/api.php) to perform article searches. The search logic is implemented in `content_push/cp-search-wikipedia.js`.

2.  To get round cross-origin restrictions, Wikipedia searches are carried out using JSONP (rather than direct HTTP requests, as they are for Google CSE).

3.  Using the WIkipedia API disables search sources. If search sources are enabled for any reason (by modifying the code), Wikipedia results will be filtered out.

## Tests

### Unit tests

The (very incomplete) test suite can be run via grunt. You will need to install the dependencies first:

    npm install

Then run the tests with:

    grunt test

### "Functional" tests

We have some manual tests for the application's UI elements which can be run in a Chrome browser (no need to install as an extension). To run them, open the file `test/functional/index.html` in Chrome. Each test has a brief description of what you should see. These can be useful if you want to make changes to CSS etc. and check them without having to run the full application.

## Experiments

We carried out a variety of "spikes" during development, which are stored in the `experiment` directory. These are:

*  `google-apps-script`: Experiment with Google Apps Script to see whether we could use its APIs to interact with the document. In the end we stuck with hacking at the HTML.
*  `google-images-exif`: Experiment to extract EXIF data from images returned by Google searches. This proved impractical as it would have required us to make separate HTTP requests for each image so we could read their binary data for EXIF tags.
*  `image-processing`: Research into alternative means of creating thumbnails on the fly (rather than using Google+). The conclusion is that we'd need a server of our own or need to pay someone for the service (there are few free services without caveats).
*  `key-phrase-extraction`: Experiment to see whether we could improve key phrase ranking and selection by cross-reference with DBpedia. The idea was to give higher scores to key phrases which had corresponding articles on Wikipedia. This seemed promising but we never incorporated it into the application.

