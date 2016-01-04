# Content Push

This is the repository for the Content Push application.

Content Push is a Chrome browser extension which works alongside a Google
Docs document. As a document is populated with text, Content Push parses
it for keywords (noun phrases). Those keywords are then used to seed
searches against a search service (Google Custom Search or Wikipedia;
see below for configuration).

## Quick Start

1. npm install
1. bower install
1. grunt dist

Install by selecting the dist/ directory with the 'Load unpacked extension...' button on the chrome://extensions page. Then open a document in Google Docs.

## Changing the search service

Content Push can use either Google Custom Search APIs or Wikipedia APIs
to provide article and image results. Wikipedia is the default.

To change the search service used, follow these steps:

1. Install Content Push as above.
1. In Chrome, open `chrome://extensions`.
1. Click on the 'background page' link for Content Push.
1. At the prompt, type 'cp.useGoogle()' or 'cp.useWikipedia()' as required.
1. Reload the Google Doc you are using with Content Push.
