# What's all this?

The directory contains a nodejs script to perform a Google Image Search,
download the first returned image, and analyse it for EXIF data. The
intention is to check whether EXIF data are embedded in images which
are returned by image searches. (You'll need to do `npm install` first.)

**Conclusions:** Google Image Search results *do not* contain EXIF data.
However, the images referred to in the search results *may* contain
EXIF data.

# What about in a browser?

I used the node-exif library for this command line version, but
exif-js (https://github.com/jseidelin/exif-js) would be suitable for a
browser-based version.

The exif-js code to do this job might look something like this:

```
EXIF.getData({src: imageUrl}, function () {
  // this refers to the EXIF data inside the callback
  console.log(EXIF.pretty(this));
});
```

However, for this to work, the JavaScript has to be executed in a
context where it isn't restricted by CORS constraints
(http://en.wikipedia.org/wiki/Cross-origin_resource_sharing); for example,
in a Chrome extension which allows access to any host. (Content Push
is already configured like this.)

# How do we do this in Content Push?

To get EXIF data into the application panel, we would wrap
any image searches so that they fetch the raw data for each image and
parse it for EXIF data. The EXIF data could then be added to the search
results before they are returned and converted into tiles.

However, we would have to do this for *every* image result, as there's
no way to tell from a result whether the image has any EXIF data. So
each image search we do currently would spawn an extra request for each
image result: e.g. to get 10 images for a keyword *without* EXIF data
currently uses 1 request to Google search; to get those results *with*
EXIF data would take 11 requests (1 request to Google search, one
request for each image to whichever server it's hosted on).
