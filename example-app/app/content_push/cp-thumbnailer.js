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
