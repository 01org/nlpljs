/**
 * ep-auth
 *
 * getToken() - initiate the process to get a token from Facebook
 *
 * message sent to content script:
 *   component:'auth',
 *   type:'accesstoken',
 *   data: {
 *     token:token
 *   }
 *
 * removeCachedToken(token): remove token from cache
 */

var epAuth = epAuth || {};

/**
 * message routing
 *  component: ('auth'||...)
 */
chrome.runtime.onMessageExternal.addListener(function(message,sender,sendResponse) {
  var keepChannelOpen=false;

  if (message.component === 'auth') {
    console.log('EP-AUTH:got message:',message);
    var service = message.service;

    if (epAuth.hasOwnProperty(service)) {
      var type = message.type;
      switch (type) {
        case 'gettoken':
          keepChannelOpen = epAuth[service].getToken(sendResponse);
          break;
        case 'removecachedtoken':
          var token = message.token;
          epAuth[service].removeCachedToken(token);
          break;
        default:
          console.log(new Error('EP-AUTH:unknown message type:'+type));
          break;
      }
    } else {
      console.log(new Error('EP-AUTH:unknown service:'+service));
    }
  }

  return keepChannelOpen; // to call sendResponse asynchronously
});

epAuth.google = (function () {
  function getToken (sendResponse) {
    // id in the manifest.json file
    chrome.identity.getAuthToken({interactive:true},function(token) {
      setAccessToken(token);
    });

    function setAccessToken (token) {
      var message = {
        component:'auth',
        type:'accesstoken',
        service:'google',
        token:token
      };
      console.log('EP-AUTH:sending message:',message);
      sendResponse(message);
    };

    return true; // response sent asynchronously
  };

  return {
    getToken: getToken
  };
})();

epAuth.facebook = (function () {
  var cache = {
    access_token: null
  };

  /**
   * constants
   */
  // id and secret from facebook's developer web site
  // associated with sig.exp.london@gmail.com
  var CLIENTID = '738428516193732';
  var CLIENTSECRET = '9f0b1a9bf3f0095245631471534b92f8';
  var HTTP_OK = 200;

  /**
   * getToken - initiate the process to get the token
   */
  function getToken (sendResponse) {
    // In case we already have an access_token cached, simply return it.
    if (cache.access_token) {
      setAccessToken(cache.access_token);
      return;
    }

    var redirectUri = makeUrl(
      {
        protocol: 'https',
        host: chrome.runtime.id + '.chromiumapp.org',
        path: '/provider_cb'
      }
    );

    // the regexp used to extract the access code from the redirect url
    var redirectRe = new RegExp(redirectUri + '[#\?](.*)');

    var url = makeUrl({
      protocol: 'https',
      host: 'www.facebook.com',
      path: '/dialog/oauth',
      params: {
        'client_id': CLIENTID,
        'response_type': 'token',
        'access_type':'online',
        'scope':['user_photos','public_profile'].join(','),
        'redirect_uri':encodeURIComponent(redirectUri)
      }
    });

    var options = {
      'interactive': true,
      url: url
    }

    chrome.identity.launchWebAuthFlow(options, function(redirectUri) {
      if (chrome.runtime.lastError) {
        console.log(new Error('EP-AUTH:'+chrome.runtime.lastError.message));
        return;
      }

      // Upon success the response is appended to redirectUri, e.g.
      // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
      //     &refresh_token={value}
      // or:
      // https://{app_id}.chromiumapp.org/provider_cb#code={value}
      var matches = redirectUri.match(redirectRe);
      if (matches && matches.length > 1) {
        handleProviderResponse(parseRedirectFragment(matches[1]));
      } else {
        console.log(new Error('EP-AUTH:Invalid redirect URI'));
      }
    });

    function parseRedirectFragment (fragment) {
      var pairs = fragment.split('&');
      var values = {};

      pairs.forEach(function(pair) {
        var nameval = pair.split('=');
        values[nameval[0].replace(/^#/,'')] = nameval[1];
      });

      return values;
    }

    function handleProviderResponse (values) {
      if (values.hasOwnProperty('access_token')) {
        setAccessToken(values.access_token);
      } else if (values.hasOwnProperty('code')) {
        exchangeCodeForToken(values.code);
      } else {
        console.log(new Error('EP-AUTH:Neither access_token nor code available.'));
      }
    };

    function exchangeCodeForToken (code) {
      console.log('EP-AUTH:exchangeCodeForToken');
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
        makeUrl({
          protocol: 'https',
          host: 'graph.facebook.com',
          path: '/content-push/access_token',
          params: {
            'client_id': CLIENTID,
            'client_secret': CLIENTSECRET,
            'redirect_uri': redirectUri,
            'code=': code
          }
        })
      );
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function () {
        if (this.status === HTTP_OK) {
          var response = JSON.parse('"'+this.responseText+'"');
          response = response.substring(0,response.indexOf('&'));
          setAccessToken(response);
          cache.access_token = response;
        }
      };
      xhr.send();
    };

    function setAccessToken (token) {
      cache.access_token = token;
      var message = {
        component:'auth',
        type:'accesstoken',
        service:'facebook',
        token:token
      };
      console.log('EP-AUTH:sending message:',message);
      sendResponse(message);
    };

    return true; // response sent asynchronously
  };

  var removeCachedToken = function (token_to_remove) {
    if (cache.access_token === token_to_remove) {
      cache.access_token = null;
    }
  };

  /**
   * makeUrl from bits
   * bits = {
   *   protocol: 'https',
   *   host: 'www.sgi.com',
   *   path: '/index.html'
   *   params: {
   *    id:'myid',
   *    data:'mydata'
   *   },
   * }
   */
  function makeUrl(bits) {
    var params=[];

    if (bits.params) {
      Object.keys(bits.params).forEach(function(key){
        var param=[key,bits.params[key]].join('=');
        params.push(param);
      });
    }

    var queryString=params.join('&');

    var url;
    url = [ bits.protocol, bits.host ].join('://');
    url = [ url, bits.path ].join('');
    url = [ url, queryString ].join('?');

    return url;
  }

  return {
    getToken: getToken,
    removeCachedToken: removeCachedToken
  };

})();
