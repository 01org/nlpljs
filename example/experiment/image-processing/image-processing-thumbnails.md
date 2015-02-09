CREATING THUMBNAILS FOR CONTENT PUSH

Content Push uses thumbnails to illustrate the small cards initially
shown for search results. However, in most cases, the search services
we're using don't provide thumbnails in a reliable way. For that
reason, we "piggy-backed" on Google Plus' thumbnailing service
to generate thumbnails on the fly from the original image.

We're probably not supposed to use Google's thumbnailing web service
this way (though I couldn't find terms and conditions explicitly
banning this, they probably exist). We also have no guarantee that the
service will be available long term (how it works and where it is
located could change without notice). So this is not a sustainable
solution long term.

Creating thumbnails from an image on the fly is a common issue, and
several pre-built web services for doing this already exist. But in
most cases, these services can only be configured to create thumbnails
for images on a restricted range of sites, and they would cost
money. For the sake of completeness, though, here are a few (NB you
can find them with a search for "responsive image web services"):

* [resrc](http://www.resrc.it/) - commercial
* [imgix](http://www.imgix.com/) - commercial
* [responsive.io](https://responsive.io/) - commercial
* [WURLF Image Tailor](http://web.wurfl.io/#wit) - free for public
websites

[imagio](https://github.com/3d0c/imagio) is an open source image processing
server which we could use to run our own web service (e.g. on Amazon
Web Services).

It is also fairly trivial to write a thumbnailing web service from
scratch. The `fetch-n-thumb.js` script in this directory is a proof
of concept which took about 3 hours to write (using nodejs). It would
not be a full solution on its own, as is; but it demonstrates the
principle and could provide a stop-gap solution in the short term.
Instructions and explanation are at the top of the file.
