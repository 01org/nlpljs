(function () {
  /* base URL for Google's image resizer (undocumented);
     see http://carlo.zottmann.org/2013/04/14/google-image-resizer/ */
  var RESIZER_BASE_URL = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy';

  var Thumbnailer = {};

  Thumbnailer.getGoogleURL = function (imageURL) {
    return RESIZER_BASE_URL +
           '?container=focus&' +
           'refresh=' + (60 * 60) + '&' + // cache for one hour
           'resize_w=600&' + // set max image width to 600px
           'url=' + encodeURIComponent(imageURL);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Thumbnailer;
  }
  else {
    window.Thumbnailer = Thumbnailer;
  }
})();
