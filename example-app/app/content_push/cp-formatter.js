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

  /* regexp for HTML tags */
  var HTML_TAG_REGEX = new RegExp('<\/?[^<>]+?\/?>', 'gm');

  /* regexp to retrieve the domain from a URL */
  var DOMAIN_REGEX = new RegExp('http[s]?:\/\/([^\/]+)\/');

  var CpFormatter = {
    /* clean HTML tags out of text */
    cleanHTML: function (text) {
      if (text && typeof(text) === 'string') {
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
