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


/**
 * Load the stored sources for the document id. The schema for the
 * source is as follows. We have 6 groups of Sources. They are,
 * Images, Quotations, Text+Images, Files, Videos and All.
 * Each group has more than 1 sources. The groups have the following
 * properties:
 * icon - the icon name for the group (from core-iconset)
 * enabled - if the group is enabled
 * sources - the sources in this group
 *
 * Sources is a collection of objects with the following properties:
 * url - the url to be used for google searching
 * enabled - if this source is enabled
 *
 * Here is the entire schema layed out. This is how data is stored in the sync storage.
 *
 * <document_id> <----> <item>
 * (key)               (value)
 *
 * <item> = {{title0: group0},{title1: group1},....,{titleN: groupN}}
 *
 * <title> : { icon: 'core-image',
 *             enabled: true,
 *             sources: <sources>
 *           }
 *
 * <sources> = {{title0 : source0}, {title1 : source1},....,{titleN: sourceN} }
 *
 * <title> : { url: 'flickr.com',
 *             enabled: true,
 *           }
 */

(function () {
  'use strict';

  var currentItem = {};

  /*
  // I'm leaving these here as this is the actual list the designers
  // want to use; we're using the cut down list (below) for performance
  // reasons
  var defaults = {
    'Images': {
      'enabled': true,
      'sources': {
        'Google Images': {
          url: 'google.com',
          enabled: true
        },
        'Flickr': {
          url: 'flickr.com',
          enabled: true
        },
        'Instagram': {
          url: 'instagram.com',
          enabled: true
        },
        'Pinterest': {
          url: 'pinterest.com',
          enabled: true
        },
        'Wikimedia commons': {
          url: 'wikimedia.org',
          enabled: true
        }
      }
    },
    'Articles': {
      'enabled': true,
      'sources': {
        'Yahoo! news': {
          url: 'news.yahoo.com',
          enabled: true
        },
        'Google news': {
          url: 'news.google.com',
          enabled: true
        },
        'BBC news': {
          url: 'bbc.co.uk',
          enabled: true
        },
        'The Guardian': {
          url: 'theguardian.com',
          enabled: true
        },
        'CNN': {
          url: 'cnn.com',
          enabled: true
        },
        'New York Times': {
          url: 'nytimes.com',
          enabled: true
        },
        'Wikipedia': {
          url: 'wikipedia.org',
          enabled: true
        },
        'Google Books': {
          url: 'books.google.com',
          enabled: true
        },
        'TED': {
          url: 'www.ted.com/topics/news',
          enabled: true
        },
        'Twitter': {
          url: 'twitter.com',
          enabled: true
        },
        'Quora': {
          url: 'quora.com',
          enabled: true
        }
      }
    },
    'Quotations': {
      'enabled': false,
      'sources': {
        'iHeart Quotes': {
          url: 'iheartquotes.com',
          enabled: false
        },
        'They said so!': {
          url: 'theysaidso.com',
          enabled: false
        }
      }
    },
    'Files': {
      'enabled': true,
      'sources': {
        'Google Drive': {
          title: 'Google Drive',
          enabled: true
        }
      }
    }
  };
  */

  // for use from the console
  window.cp = window.cp || {
    help: function() {
      console.log('EP-SOURCES-STORAGE: cp.clearStorage() - clear all storage');
      console.log('EP-SOURCES-STORAGE: cp.removeSources(documentId) - remove just one source property from storage');
      console.log('EP-SOURCES-STORAGE: cp.dumpStorage(documentId) - dump storage for documentId, or all storage if null');
      console.log('EP-SOURCES-STORAGE: cp.useGoogle() - use Google as a search service');
      console.log('EP-SOURCES-STORAGE: cp.useWikipedia() - use Wikipedia as a search service');
    },

    useGoogle: function () {
      defaults.SearchService = 'Google';
      this.clearStorage();
    },

    useWikipedia: function () {
      defaults.SearchService = 'Wikipedia';
      this.clearStorage();
    },

    clearStorage: function () {
      currentItem = {};
      chrome.storage.sync.clear(function () {
        if (chrome.runtime.lastError) {
          console.log('EP-SOURCES-STORAGE:', chrome.runtime.lastError);
        } else {
          console.log('EP-SOURCES-STORAGE: done' );
          console.log('EP-SOURCES-STORAGE: please reload tabs');
        }
      });
    },

    removeSources: function (documentId) {
      chrome.storage.sync.remove(documentId);
    },

    dumpStorage: function (documentId) {
      chrome.storage.sync.get(documentId, function (result) {
        console.log('EP-SOURCES-STORAGE:', result);
      });
    }
  };

  // cut down version of the defaults
  var defaults = {
    'SearchService': 'Wikipedia',
    'Images': {
      order: 1,
      enabled: true,
      'sources': {
        'Flickr': {
          url: 'flickr.com',
          enabled: true
        },
        'Wikimedia commons': {
          url: 'wikimedia.org',
          enabled: true
        }
      }
    },
    'Articles': {
      order: 2,
      enabled: true,
      'sources': {
        'Yahoo! news': {
          url: 'news.yahoo.com',
          enabled: true
        },
        'Wikipedia': {
          url: 'wikipedia.org',
          enabled: true
        }
      }
    },
    'Quotes': {
      order: 3,
      enabled: false,
      'sources': {
        'iHeart Quotes': {
          url: 'iheartquotes.com',
          enabled: false
        },
        'They said so!': {
          url: 'theysaidso.com',
          enabled: false
        }
      }
    },
    'Files': {
      order: 4,
      enabled: true,
      'sources': {
        'Google Drive': {
          title: 'Google Drive',
          enabled: true
        }
      }
    },
    'Videos': {
      order: 5,
      enabled: false,
      'sources': {
      }
    }
  };

  function dumpCurrentItem (documentId) {
    console.log('EP-SOURCES-STORAGE:Sources selection for:' + documentId);
    for (var key in currentItem[documentId]) {
      for (var src in currentItem[documentId][key].sources) {
        console.log('EP-SOURCES-STORAGE:source url:' + currentItem[documentId][key].sources[src].url);
        console.log('EP-SOURCES-STORAGE:source enabled:' + currentItem[documentId][key].sources[src].enabled);
      }
    }
    return currentItem[documentId];
  }

  function loadSources (documentId, result, port) {
    if (result.hasOwnProperty(documentId)) {
      console.log('EP-SOURCES-STORAGE:result:' + result[documentId]);
      currentItem[documentId] = result[documentId];

      dumpCurrentItem(documentId);

      var message = {
        component: 'sources',
        data: currentItem[documentId]
      };

     port.postMessage(message);
    } else {
      var obj = {};
      obj[documentId] = defaults;
      console.log('EP-SOURCES-STORAGE:Adding defaults');
      chrome.storage.sync.set(obj, function () {
        if (chrome.runtime.lastError) {
          console.log('EP-SOURCES-STORAGE:error storing defaults:' + chrome.runtime.lastError);
        }
      });
      chrome.storage.sync.get(documentId, function (result) {
        loadSources(documentId, result, port);
      });
    }
  }

  function saveSources (documentId, sources) {
    currentItem[documentId] = sources;

    chrome.storage.sync.set(currentItem, function () {
      if (chrome.runtime.lastError) {
        console.log('EP-SOURCES-STORAGE:error storing defaults:', chrome.runtime.lastError);
      } else {
        console.log('EP-SOURCES-STORAGE:sources saved successfully.');
      }
    });
  }


  chrome.runtime.onConnectExternal.addListener(function (newPort) {
    if (newPort.name === 'sources') {
      newPort.onMessage.addListener(function (message) {
        if (message.component === 'sources') {
          console.log('EP-SOURCES-STORAGE:got message:', message);
          var documentId = message.documentId;

          if (message.action === 'get') {

            if (!currentItem.hasOwnProperty(documentId)) {
              chrome.storage.sync.get(documentId, function(result) {
                loadSources(documentId, result, newPort);
              });
            } else {
              var message = {
                component: 'sources',
                data: currentItem[documentId]
              };
              newPort.postMessage(message);
            }

          } else
          if (message.action === 'set') {
            saveSources(documentId, message.data);
          } else {
            console.error(new Error('EP-SOURCES-STORAGE:unknown action:'+message.action));
          }
        }
      });
    }
  });

  /**
   * TODO: take changes made on other machines
   */
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
  });

})();
