/**
 * Load the stored sources for the tab URL. The schema for the
 * source is as follows. We have 6 groups of Sources. They are,
 * Images, Quotations, Text+Images, Files, Videos and All.
 * Each group has more than 1 sources. The groups have the following
 * properties:
 * title - name of the group
 * icon - the icon name for the group (from core-iconset)
 * enabled - if the group is enabled
 * sources - the sources in this group
 *
 * Sources is a collection of objects with the following properties:
 * title - Title for the source.
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
 * <title> : { title: 'Images',
 *             icon: 'core-image',
 *             enabled: true,
 *             sources: <sources>
 *           }
 *
 * <sources> = {{title0 : source0}, {title1 : source1},....,{titleN: sourceN} }
 *
 * <title> : { title: 'flickr',
 *             url: 'flickr.com',
 *             enabled: true,
 *           }
 */

(function () {
  var url = document.URL;
  var currentItem = null;
  var storage = null;

  var defaults = {
    'Images': {
      'title': 'Images',
      'icon': 'drive-image',
      'enabled': true,
      'sources': {
        'Google Images' : {
          title: 'Google Images',
          url: 'google.com',
          enabled: true
        },
        'Flickr' :        {
          title: 'Flickr',
          url: 'flickr.com',
          enabled: true
        }
      }
    },
    'Quotations': {
      'title': 'Quotations',
      'icon': 'editor:format-color-text',
      'enabled': false,
      'sources': {
        'iHeart Quotes': {
          title: 'iHeart Quotes',
          url: 'iheartquotes.com',
          enabled: false
        },
        'They said so': {
          title: 'They Said So!',
          url: 'theysaidso.com',
          enabled: false
        }
      }
    }
  };

  /* Uncomment to over write the sync storage */
  //chrome.storage.sync.remove(url);

  chrome.storage.sync.get(url, loadSources);

  function loadSources(result) {
    if (result.hasOwnProperty(url)){
      console.log('result:' + result[url]);
      currentItem = result[url];
      dumpCurrentItem();
    } else {
      var obj = {};
      obj[url] = defaults;
      console.log('Adding defaults');
      chrome.storage.sync.set(obj, function() {
        if (chrome.runtime.lastError) {
          console.log('error storing defaults:' + chrome.runtime.lastError);
        }
      });
      chrome.storage.sync.get(url, loadSources);
    }
  }

  function dumpCurrentItem() {
    console.log('Sources selection for:' + url);
    for (var key in currentItem) {
      console.log('Group Name:' + currentItem[key].title);
      console.log('Enabled:' + currentItem[key].enabled);
      for (var src in currentItem[key].sources) {
        console.log('source title:' + currentItem[key].sources[src].title);
        console.log('source url:' + currentItem[key].sources[src].url);
        console.log('source enabled:' + currentItem[key].sources[src].enabled);
      }
    }
  }
})();
