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

    /* format a date string in format '2014-09-08T10:05:15.497Z'
       and return just the YYYY-MM-DD */
    formatDate: function (dateStr) {
      try {
        var dt = new Date(dateStr);
        var month = dt.getMonth();
        var day = dt.getDay();

        month = (month < 10 ? '0' + month : month);
        day = (day < 10 ? '0' + day : day);

        return dt.getFullYear() + '-' + month + '-' + day;
      } catch (e) {
        return 'unknown';
      }
    },

    /* extract the domain from a URL string */
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
