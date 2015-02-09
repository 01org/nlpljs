onmessage = function (event) {
  var request = event.data;
  var requestId = request.id;
  var url = request.url;

  var xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 /* DONE */) {
      if (!(("" + xhr.status).match(/2\d\d/))) {
        postMessage({
          id: requestId,
          response: {
            error: JSON.stringify(this)
          }
        });
      }
      else {
        postMessage({
          id: requestId,
          requestUrl: url,
          response: JSON.parse(this.responseText)
        });
      }
    }
  };

  xhr.send();
};
