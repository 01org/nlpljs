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

  var open = true;

  chrome.runtime.onMessage.addListener(function (message) {
    if (message === 'cp-toggle') {
      document.querySelector('cp-main').setAttribute('toggle', open);
      open = !open;
    }
  });

  chrome.runtime.sendMessage('cp-init');

  rehostPage();

  function rehostPage () {
    // create and open panel
    var currentTabUrl = document.URL;
    var extensionUrl = chrome.extension.getURL('');
    var cpMainUrl = chrome.extension.getURL('content_push/cp-main.html');
    var cpGlobalsUrl = chrome.extension.getURL('content_push/cp-globals.html');
    var cssUrl = chrome.extension.getURL('styles/main.css');

    // remove document content and add new head and body
    document.removeChild(document.documentElement);
    var html = document.createElement('html');
    var head = document.createElement('head');
    var body = document.createElement('body');
    body.setAttribute('unresolved', '');
    body.setAttribute('fit', '');

    var base = document.createElement('base');
    base.setAttribute('href', extensionUrl);
    head.appendChild(base);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    head.appendChild(link);

    // work around for a google-apis bug
    var script = document.createElement('script');
    head.appendChild(script);

    link = document.createElement('link');
    link.rel = 'import';
    link.href = cpGlobalsUrl;
    head.appendChild(link);

    link = document.createElement('link');
    link.rel = 'import';
    link.href = cpMainUrl;
    head.appendChild(link);

    var cpGlobals = document.createElement('cp-globals');
    cpGlobals.setAttribute('app_id', chrome.runtime.id);
    cpGlobals.setAttribute('iframeurl', currentTabUrl);

    body.appendChild(cpGlobals);

    var cpMain = document.createElement('cp-main');
    cpMain.setAttribute('fit', '');

    body.appendChild(cpMain);

    html.appendChild(head);
    html.appendChild(body);
    document.appendChild(html);
  }
})();
