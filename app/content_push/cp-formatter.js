(function () {
  /* regexp for HTML tags */
  var HTML_TAG_REGEX = new RegExp('<\/?[^<>]+?\/?>', 'gm');

  /* regexp to retrieve the domain from a URL */
  var DOMAIN_REGEX = new RegExp('http[s]?:\/\/([^\/]+)\/');

  var CpFormatter = {
    /* clean HTML tags out of the caption */
    stripHTMLTags: function (caption) {
      if (caption) {
        return caption.replace(HTML_TAG_REGEX, '');
      } else {
        return caption;
      }
    },

    domainFromURL: function (url) {
      if (url) {
        var matches = DOMAIN_REGEX.exec(url);
        if (matches) {
          return matches[1];
        } else {
          return url;
        }
      } else {
        return url;
      }
    }
  };

  window.Formatter = CpFormatter;
})();
