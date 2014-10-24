# Content Push

This is the repository for the Content Push application.

## Quick Start

1. bower install
1. # install by selecting the / directory with the 'Load unpacked extension...' button on the chrome://extensions page.

Then open a document and click on the browser action button. This should cause the doc to reload with a panel to the right of it.

If you don't want to do your own build, a recent build is available in the `dist/` directory. This includes a `version.json` file which contains information about the application version, build date and time, and the git commit ID used for the build.

## Developers discussion

The app files are in `app/`.
The app is partly a chrome extension and partly a web app that is 'injected' using a content script.
* `app/scripts/event_page.js` is the event page (a type of background page). It adds the page action button and sends a message to the content script to 'start'.
* `app/scripts/rehostPage.js` is the content script that is injected into the docs.google.com page. It records the docs url, empties the document and rebuilds the page content including the `<content-push>` element, and the final thing done in the content script is to set an `iframeurl` attribute on that so that it knows what url to load in its iframe.
* `app/content-push/content-push.html` is the content push polymer element. *This is where most of our work is done* - extracting text from the docs iframe, adding images to the CP panel, and communicating with the NLP libraries.
