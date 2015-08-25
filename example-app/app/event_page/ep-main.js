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

chrome.runtime.onMessage.addListener(function (message, sender) {
  'use strict';

  if (message === 'cp-init' ) {
    chrome.pageAction.show(sender.tab.id);
  }
});

if (chrome.pageAction) {
  chrome.pageAction.onClicked.addListener(function (tab) {
    'use strict';

    chrome.tabs.sendMessage(tab.id, 'cp-toggle');
  });
}
