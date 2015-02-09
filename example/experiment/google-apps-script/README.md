This is an experiment with adding endnotes to a Google Doc
using Google Apps Script (https://developers.google.com/apps-script/).

# Running the example

1.  Log in using your Intel account (you need to be in this account to
be able to edit the Battle of Hastings doc).
2.  Create a new document in Google Docs and open it.
3.  Go to "Tools &gt; Script Editor".
4.  Select "Create Script for Blank Project".
5.  Copy the content of the `Code.gs` file in this directory into the
`Code.gs` file in your project.
6.  Save it (use whatever project name you like).
7.  Select "Publish &gt; Deploy as web app...".
8.  Click "Save new version", to create version 1 of the app.
9.  Under "Execute the app as:", select "User accessing the web app".
10. Under "Who has access to the web app", select "Only myself". NB
you would need to change this when publishing the script for anyone
to use.
11. Click "OK" to publish the app.
12. You should now get a confirmation dialog which contains the URL
for the published application. Copy that URL.
13. Paste the URL into your browser. On the first access, you will be
prompted to grant access to the application. Accept the prompts.

The first time you access the script through its plain URL, you will
get an error, as it needs some parameters. It should look something like this:

    {
      "status":"ERROR",
      "errors":[
        "No docId parameter passed",
        "No referenceText parameter passed"
      ],
      "originalRequest":{
        "queryString":null,
        "parameter":{},
        "contextPath":"",
        "parameters":{},
        "contentLength":-1
      }
    }

To use the script, you need to pass *docId* and *referenceText*
parameters. Take the URL for the service and append a querystring
like this to it:

    ?docId=&lt;doc ID&gt;&referenceText=hello+endnoter

The &lt;doc ID&gt; should be the ID of a document which your account
has access to on Google Drive. You can find this ID by opening a
document and copying the long obscure string out of its URL, e.g.
the Battle of Hastings doc with URL:

https://docs.google.com/a/intel.com/document/d/13_B9nTy2uIeOEH8W_YEc8BokyZVug7nayCXI94q9HhA/edit

has the ID **13_B9nTy2uIeOEH8W_YEc8BokyZVug7nayCXI94q9HhA**.

When you access the URL with the querystring attached, you should
get this response in the browser:

    {
      "status": "OK",
      "docId": "13_B9nTy2uIeOEH8W_YEc8BokyZVug7nayCXI94q9HhA",
      "referenceText": "hello endnoter",
      "refNumber": 1
    }

You should also see a table appended to the Google Docs document, with
the heading **Content Push References**.

# Notes on the Google Apps Script API

* There's no API for adding footnotes, so I resorted to adding a table at
the end of the document.

* There's no way to get a cursor to insert the reference into the document:
the getCursor() method does exist but doesn't work unless you're using a bound
script (this script isn't bound as it fetches the document dynamically); so
we'd have to write some highlighter-style hacks to accomplish this, or figure out
a way to install this script into a user's document from our app via
the extension part of it, possibly using the chrome.webstore API
(https://developer.chrome.com/extensions/webstore).

* If the user removes lines from the references table, the corresponding
references to it in the document aren't removed (see above); numbering
may also go out of whack (e.g. if you delete reference 4, then add another
reference, that will be assigned the number 4 as well). One solution might
be to maintain the reference numbers in the app.

* References are numbered by insert order. So if you add references 1 and 2,
then insert another between them, the references aren't renumbered to reflect
the new order (i.e. the order of references in the document would be 1, 3, 2).

* If the user deletes the references table, there's no way to reconstruct
it; this would require some client-side storage, plus pushing the
state of all the user's references to this script each time a change
was needed, then clearing and redrawing the whole table via this script.
