/*
 * Natural Language Processing Library for JavaScript
 *
 * A client-side NLP utility library for web applications
 *
 * Copyright 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *   Plamena Manolova <plamena.manolova@intel.com>
 */

(function () {
  'use strict';

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

  /* globals module:true */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jsonp;
  }
  else {
    window.jsonp = jsonp;
  }
})();
