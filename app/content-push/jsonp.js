(function () {
  /**
   * Send a jsonp request (useful for cross-domain requests) by
   * inserting a <script> into the page.
   *
   * @param {string} opts.url (REQUIRED)  Request URL
   * @param {function} opts.cb (REQUIRED)  Callback which will receive
   * the parsed object from the original JSON string
   * @param {function} opts.cbParam  Parameter name to append the jsonp
   * callback parameter to; defaults to "callback"
   *
   * @returns {string} The ID of the request, which can be used to remove
   * the script manually from the page if desired (each is given a
   * "data-cb_contentpush_jsonp-id" attribute set to this returned ID);
   * NB <script> elements are inserted into the body of the page
   */

  /* unique identifier for callbacks, incremented each time we create one */
  var cbId = 1;

  /* prefix for our callbacks (which are attached to the window) */
  var cbKey = '_contentpush_jsonp';

  var jsonp = function (opts) {
    var thisCbId = cbId;

    var url = opts.url +
              /* if no question mark, add one */
              (/\?/.test(opts.url) ? '' : '?') +

              /* if at least one character in querystring, add '&' */
              (/\?.+/.test(opts.url) ? '&' : '') +

              (opts.cbParam || 'callback') +
              '=' + cbKey + thisCbId;

    var script = document.createElement('script');
    script.setAttribute('data-cb' + cbKey + '-id', thisCbId);
    script.src = url;

    /* we make a uniquely-named callback function, globally visible,
       which will be invoked with the object parsed from the response */
    window[cbKey + thisCbId] = function (obj) {
      /* invoke the original callback */
      opts.cb(obj);

      /* remove _this_ global callback */
      window[cbKey + thisCbId] = null;
    };

    /* make the magic happen */
    document.body.appendChild(script);

    /* increment the counter ready to create the next callback */
    cbId++;

    return thisCbId;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsonp;
  }
  else {
    window.jsonp = jsonp;
  }
})();
