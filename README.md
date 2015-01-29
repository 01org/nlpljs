# Content Push

This is the repository for the Content Push application.

Content Push is a Chrome browser extension which works alongside a Google Docs document. As a document is populated with text, Content Push parses it for keywords (noun phrases). Those keywords are then used to seed searches against a search service (Google Custom Search or Wikipedia; see below for configuration).

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
