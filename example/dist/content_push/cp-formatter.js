(function () {
  /* regexp for HTML tags */
  var HTML_TAG_REGEX = new RegExp('<\/?[^<>]+?\/?>', 'gm');

  /* regexp to retrieve the domain from a URL */
  var DOMAIN_REGEX = new RegExp('http[s]?:\/\/([^\/]+)\/');

  var CpFormatter = {
    /* clean HTML tags out of text */
    cleanHTML: function (text) {
      if (text) {
        text = text.replace(HTML_TAG_REGEX, '');

        /* replace nbsp */
        text = text.replace(/&nbsp;/g, ' ');

        /* replace unicode entities */
        text = text.replace(/&\#.+?;/g, ' ');
      }
      return text;
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
    },

    /* round number "num" to "places" decimal places */
    round: function (num, places) {
      if (!num) {
        return 0;
      }

      var multiplier = Math.pow(10, places);
      return Math.round(num * multiplier) / multiplier;
    }
  };

  window.Formatter = CpFormatter;
})();
