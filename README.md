# Content Push

This is the repository for the Content Push application.

## Quick Start

1. npm install
1. bower install
1. grunt build
1. # install by selecting the build/ directory with the 'Load unpacked extension...' button on the chrome://extensions page.

Then open a document and click on the browser action button. This should cause the doc to reload with a panel to the right of it.

If you don't want to do your own build, a recent build is available in the `dist/` directory. This includes a `version.json` file which contains information about the application version, build date and time, and the git commit ID used for the build.

## Developers discussion

The app files are in `app/`.
The app is a chrome extension.
* `app/scripts/event_page.js` is the event page (a type of background page). It adds the page action button and sends a message to the content script to 'start'.
* `app/scripts/rehostPage.js` is the content script that is injected into the docs.google.com page. It records the docs url, replaces the page with an `<link rel="import" href="index.html">` element to load the Content Push page contained in `index.html`, and then replaces the `<head>` and `<body>` with those from the import. The `index.html` file contains just a single `<content-push>` element, and the final thing done in the content script is to set an `iframeurl` attribute on that so that it knows what url to load in its iframe.
* `app/index.html` is the Content Push page. It contains just the `<content-push>` element.
* `app/content-push/content-push.html` is the content push polymer element. *This is where most of our work is done* - extracting text from the docs iframe, adding images to the CP panel, and communicating with the NLP libraries.

You should note that the `grunt build` step is primarily to convert the polymer elements so that they conform to the [Chrome Content Security Policy](http://www.polymer-project.org/resources/faq.html#csp). We use a tool called [Vulcanize](https://github.com/Polymer/grunt-vulcanize) to do that. The main effect of this is to concatenate all the javascript into `index-csp.js` and the polymer html into `index.html`. So, don't expect to look at the source for the page in chrome and see the simple version of the code that is in app/, but you can still see your code in there and it is usable and debuggable. Perhaps in future we can work on using source maps to make it 'look' the same.

## Notes

1. Some elements are coloured with blatent colours in order to easily see what is happening.
