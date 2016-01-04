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

  window.CP_CONSTANTS = {
    /* icons for services which can serve files */
    SERVICE_ICONS: {
      'Drive': 'cloud'
    },

    /* mapping from mime type to user-friendly document type */
    MIME_TYPES: {
      'application/vnd.google-apps.document': 'Google Docs',
      'text/plain': 'Text file'
    },

    /* timeout for images to load within (ms) */
    TIMEOUT: 5000
  };
})();
