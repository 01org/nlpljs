/**
 * Load the stored sources for the tab URL. The schema for the
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
 * <tab_url> <----> <item>
 * (key)           (value)
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
  var currentItem = {};
  var storage = null;
  var port;

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

  // cut down version of the defaults
  var defaults = {
    'Images': {
      'enabled': true,
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
      'enabled': true,
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

  /* Uncomment to over write the sync storage */
  //chrome.storage.sync.remove(url);

  function loadSources(url,result) {
    if (result.hasOwnProperty(url)){
      console.log('EP-SOURCES-STORAGE:result:' + result[url]);
      currentItem[url] = result[url];

      dumpCurrentItem(url);

      var message = {
        component: 'sources',
        data: currentItem[url]
      };

     port.postMessage(message);
    } else {
      var obj = {};
      obj[url] = defaults;
      console.log('EP-SOURCES-STORAGE:Adding defaults');
      chrome.storage.sync.set(obj, function() {
        if (chrome.runtime.lastError) {
          console.log('EP-SOURCES-STORAGE:error storing defaults:' + chrome.runtime.lastError);
        }
      });
      chrome.storage.sync.get(url, function(result) {
        loadSources(url,result);
      });
    }
  }

  function saveSources(url, sources) {
    currentItem[url] = sources;

    chrome.storage.sync.set(currentItem, function() {
      if (chrome.runtime.lastError) {
        console.log('EP-SOURCES-STORAGE:error storing defaults:', chrome.runtime.lastError);
      } else {
        console.log('EP-SOURCES-STORAGE:sources saved successfully.');
      }
    });
  }

  function dumpCurrentItem(url) {
    console.log('EP-SOURCES-STORAGE:Sources selection for:' + url);
    for (var key in currentItem[url]) {
      console.log('EP-SOURCES-STORAGE:Enabled:' + currentItem[url][key].enabled);
      for (var src in currentItem[url][key].sources) {
        console.log('EP-SOURCES-STORAGE:source url:' + currentItem[url][key].sources[src].url);
        console.log('EP-SOURCES-STORAGE:source enabled:' + currentItem[url][key].sources[src].enabled);
      }
    }
  }

  chrome.runtime.onConnectExternal.addListener(function(newPort) {
    port = newPort;

    port.onMessage.addListener(function(message) {
      if (message.component === 'sources') {
        console.log('EP-SOURCES-STORAGE:got message:',message);
        var url = message.url;

        if (message.action === 'get') {

          if (!currentItem.hasOwnProperty(url)) {
            chrome.storage.sync.get(url, function(result) {
              loadSources(url,result);

            });
          } else {
            var message = {
              component: 'sources',
              data: currentItem[url]
            };
            port.postMessage(message);
          }

        } else
        if (message.action === 'set') {
          saveSources(url, message.data);
        } else {
          console.error(new Error('EP-SOURCES-STORAGE:unknown action:'+message.action));
        }
      }
    });
  });

  /**
   * TODO: take changes made on other machines
   */
  chrome.storage.onChanged.addListener(function(changes, namespace) {
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
