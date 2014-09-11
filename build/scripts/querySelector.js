(function(){

  chrome.runtime.onMessage.addListener( function handleQuery(query,sender,sendResponse) {
    var queryResult="";

    // do scraping
    if (query.mode=="single") {
      queryResult=document.querySelector(query.selector).innerText;
    } else {
      // assume query.mode=="all"
      var elements=document.querySelectorAll(query.selector);
      for (var index=0; index<elements.length; index++) {
        queryResult+=elements[index].innerText;
      }
    }

    // send results back to event page
    sendResponse(queryResult);
  } );
})();
