# Content Push

This is the repository for the Content Push application.

## Quick Start

1. bower install
1. # install by selecting the / directory with the 'Load unpacked extension...' button on the chrome://extensions page.

Then open a document and click on the browser action button. This should cause the doc to reload with a panel to the right of it.

If you don't want to do your own build, a recent build is available in the `dist/` directory. This includes a `version.json` file which contains information about the application version, build date and time, and the git commit ID used for the build.

## Changing the search service

Content Push can use either Google Custom Search APIs or Wikipedia APIs to provide article and image results. Wikipedia is the default.

To change the search service used, follow these steps:

1. Open the file `app/content_script/cs-rehost-page.js` in a text editor.
2. At the top of the file, change the `SEARCH_SERVICE` variable's value to one of "Wikipedia" or "Google" to set the service used.
3. In Chrome, open `chrome://extensions`.
4. Reload the Content Push extension.
5. Reload the Google Doc you are using with Content Push.

## Developers discussion

The app files are in `app/`.
The app is partly a chrome extension and partly a web app that is 'injected' using a content script.
* `app/event_page/ep-main.js` is the event page (a type of background page). It adds the page action button and sends a message to the content script to 'start'.
* `app/content_script/cs-rehost-page.js` is the content script that is injected into the docs.google.com page. It records the docs url, empties the document and rebuilds the page content including the `<content-push>` element, and the final thing done in the content script is to set an `iframeurl` attribute on that so that it knows what url to load in its iframe.
* `app/content_push/content-push.html` is the content push polymer element. *This is where most of our work is done* - extracting text from the docs iframe, adding images to the CP panel, and communicating with the NLP libraries.
