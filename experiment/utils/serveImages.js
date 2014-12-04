/* example article url and server response
https://www.googleapis.com/customsearch/v1?key=AIzaSyARyiQ40rIjCtqtamRW98McMrU1gFgDPDE&cx=010167764530769062315:196d4y__4ss&safe=high&num=10&start=1&q=%22such%20great%20losses%22&siteSearchFilter=i&siteSearch=wikipedia.org
{
 "kind": "customsearch#search",
 "url": {
  "type": "application/json",
  "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&sta…imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
 },
 "queries": {
  "request": [
   {
    "title": "Google Custom Search - \"such great losses\"",
    "totalResults": "3",
    "searchTerms": "\"such great losses\"",
    "count": 3,
    "startIndex": 1,
    "inputEncoding": "utf8",
    "outputEncoding": "utf8",
    "safe": "high",
    "cx": "010167764530769062315:196d4y__4ss",
    "siteSearch": "wikipedia.org",
    "siteSearchFilter": "i"
   }
  ]
 },
 "context": {
  "title": "Content Push"
 },
 "searchInformation": {
  "searchTime": 0.105973,
  "formattedSearchTime": "0.11",
  "totalResults": "3",
  "formattedTotalResults": "3"
 },
 "items": [
  {
   "kind": "customsearch#result",
   "title": "User:DonnaAfrica - Wikipedia, the free encyclopedia",
   "htmlTitle": "User:DonnaAfrica - Wikipedia, the free encyclopedia",
   "link": "http://en.wikipedia.org/wiki/User:DonnaAfrica",
   "displayLink": "en.wikipedia.org",
   "snippet": "... Warrior and \"The Queen of Dreams\" when her Mother sadly passed away in \n2007, at her lowest ebb & feeling overwhelmed by such great losses and despair,\n ...",
   "htmlSnippet": "... Warrior and &quot;The Queen of Dreams&quot; when her Mother sadly passed away in \u003cbr\u003e\n2007, at her lowest ebb &amp; feeling overwhelmed by \u003cb\u003esuch great losses\u003c/b\u003e and despair,\u003cbr\u003e\n&nbsp;...",
   "cacheId": "kT56CAhdSxsJ",
   "formattedUrl": "en.wikipedia.org/wiki/User:DonnaAfrica",
   "htmlFormattedUrl": "en.wikipedia.org/wiki/User:DonnaAfrica"
  },
  {
   "kind": "customsearch#result",
   "title": "Wang Zhongsi - Wikipedia, the free encyclopedia",
   "htmlTitle": "Wang Zhongsi - Wikipedia, the free encyclopedia",
   "link": "http://en.wikipedia.org/wiki/Wang_Zhongsi",
   "displayLink": "en.wikipedia.org",
   "snippet": "... be such a defensive position that such great losses were necessary to capture \nit. He opined that this was an allegation manufactured by Wang's descendants.",
   "htmlSnippet": "... be such a defensive position that \u003cb\u003esuch great losses\u003c/b\u003e were necessary to capture \u003cbr\u003e\nit. He opined that this was an allegation manufactured by Wang&#39;s descendants.",
   "cacheId": "Zfzh66-KgLwJ",
   "formattedUrl": "en.wikipedia.org/wiki/Wang_Zhongsi",
   "htmlFormattedUrl": "en.wikipedia.org/wiki/Wang_Zhongsi"
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Hastings - Wikipedia, the free encyclopedia",
   "htmlTitle": "Battle of Hastings - Wikipedia, the free encyclopedia",
   "link": "http://en.wikipedia.org/wiki/Battle_of_Hastings",
   "displayLink": "en.wikipedia.org",
   "snippet": "Harald of Norway and Tostig were killed, and the Norwegians suffered such great \nlosses that only 24 of the original 300 ships were required to carry away the ...",
   "htmlSnippet": "Harald of Norway and Tostig were killed, and the Norwegians suffered \u003cb\u003esuch great\u003c/b\u003e \u003cbr\u003e\n\u003cb\u003elosses\u003c/b\u003e that only 24 of the original 300 ships were required to carry away the&nbsp;...",
   "cacheId": "B6oXb_1hDREJ",
   "formattedUrl": "en.wikipedia.org/wiki/Battle_of_Hastings",
   "htmlFormattedUrl": "en.wikipedia.org/wiki/Battle_of_Hastings",
   "pagemap": {
    "cse_image": [
     {
      "src": "http://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Harold_dead_bayeux_tapestry.png/300px-Harold_dead_bayeux_tapestry.png"
     }
    ],

    "cse_thumbnail": [
     {
      "width": "240",
      "height": "169",
      "src": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQmfUs5VED7yKq2ZZafmE_J355PfLEDDrzBGbEVdv-yiL3Zz9avz7__70k"
     }
    ]

   }
  }
 ]
}
*/

/* example image search url and server response, for reference
https://www.googleapis.com/customsearch/v1?searchType=image&key=AIzaSyARyiQ40rIjCtqtamRW98McMrU1gFgDPDE&cx=010167764530769062315:196d4y__4ss&safe=high&num=10&start=1&q=%22tostig%20and%20hardrada%20at%20stamford%22&siteSearchFilter=i&siteSearch=flickr.com
{
 "kind": "customsearch#search",
 "url": {
  "type": "application/json",
  "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&cref={cref?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&relatedSite={relatedSite?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
 },
 "queries": {

  "nextPage": [
   {
    "title": "Google Custom Search - \"battle",
    "totalResults": "162000000",
    "searchTerms": "\"battle",
    "count": 10,
    "startIndex": 11,
    "inputEncoding": "utf8",
    "outputEncoding": "utf8",
    "safe": "high",
    "cx": "010167764530769062315:196d4y__4ss",
    "searchType": "image"
   }
  ],

  "request": [
   {
    "title": "Google Custom Search - \"battle",
    "totalResults": "162000000",
    "searchTerms": "\"battle",
    "count": 10,
    "startIndex": 1,
    "inputEncoding": "utf8",
    "outputEncoding": "utf8",
    "safe": "high",
    "cx": "010167764530769062315:196d4y__4ss",
    "searchType": "image"
   }
  ]
 },
 "context": {
  "title": "Content Push"
 },
 "searchInformation": {
  "searchTime": 0.314072,
  "formattedSearchTime": "0.31",
  "totalResults": "162000000",
  "formattedTotalResults": "162,000,000"
 },
 "items": [
  {
   "kind": "customsearch#result",
   "title": "The Daily Battle - CrossFit LittletonCrossFit Littleton",
   "htmlTitle": "The Daily \u003cb\u003eBattle\u003c/b\u003e - CrossFit LittletonCrossFit Littleton",
   "link": "http://crossfitlittleton.net/wp-content/blogs.dir/29/files/2014/06/battle.jpg",
   "displayLink": "crossfitlittleton.net",
   "snippet": "battle",
   "htmlSnippet": "\u003cb\u003ebattle\u003c/b\u003e",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://crossfitlittleton.net/2014/06/26/daily-battle/",
    "height": 1200,
    "width": 1920,
    "byteSize": 567508,
    "thumbnailLink": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSldj546EX2xxEAHDfTGZrAWKdlspbhRDsylLKmx8vLQJmg4ByoJGOWaFss",
    "thumbnailHeight": 94,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Glorieta Pass - Pecos National Historical Park (U.S. ...",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of Glorieta Pass - Pecos National Historical Park (U.S. \u003cb\u003e...\u003c/b\u003e",
   "link": "http://www.nps.gov/peco/historyculture/images/The-Battle-of-Glorieta-Pass.jpg",
   "displayLink": "www.nps.gov",
   "snippet": "Battle of Glorieta Pass",
   "htmlSnippet": "\u003cb\u003eBattle\u003c/b\u003e of Glorieta Pass",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://www.nps.gov/peco/historyculture/copy-of-battleofglorietta.htm",
    "height": 345,
    "width": 556,
    "byteSize": 79598,
    "thumbnailLink": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQjd4bzjNyy9Bs3el4TkEX5eN-Hzjoe98UA04LGB1YCgQyGHMpDiR_JOC4",
    "thumbnailHeight": 83,
    "thumbnailWidth": 133
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Orsha - Wikipedia, the free encyclopedia",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of Orsha - Wikipedia, the free encyclopedia",
   "link": "http://upload.wikimedia.org/wikipedia/commons/b/b9/Krell_Battle_of_Orsha_01.jpg",
   "displayLink": "en.wikipedia.org",
   "snippet": "Battle of Orsha",
   "htmlSnippet": "\u003cb\u003eBattle\u003c/b\u003e of Orsha",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://en.wikipedia.org/wiki/Battle_of_Orsha",
    "height": 1568,
    "width": 2500,
    "byteSize": 1731647,
    "thumbnailLink": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpUAlkkA6VH9AIRHzVcTbj3U_8d4OhGyyiuoHg8eDi69a8KhVcspJ7WDA",
    "thumbnailHeight": 94,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of the Rich Mountain",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of the Rich Mountain",
   "link": "http://www.sonofthesouth.net/leefoundation/rich-mountain/battle-rich-mountain.jpg",
   "displayLink": "www.sonofthesouth.net",
   "snippet": "Civil War Battle of Rich",
   "htmlSnippet": "Civil War \u003cb\u003eBattle\u003c/b\u003e of Rich",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://www.sonofthesouth.net/leefoundation/battle-rich-mountain.htm",
    "height": 1424,
    "width": 1808,
    "byteSize": 790502,
    "thumbnailLink": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQV0mz-Yot-ZEMkyTQeZ5njLIaltHC60UjnO5eqcWVsy-lLqL2aPrVxBrlD",
    "thumbnailHeight": 118,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Waterloo - Wikipedia, the free encyclopedia",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of Waterloo - Wikipedia, the free encyclopedia",
   "link": "http://upload.wikimedia.org/wikipedia/commons/7/72/Battle_of_Waterloo_1815.PNG",
   "displayLink": "en.wikipedia.org",
   "snippet": "Battle of Waterloo 1815.PNG",
   "htmlSnippet": "\u003cb\u003eBattle\u003c/b\u003e of Waterloo 1815.PNG",
   "mime": "image/png",
   "fileFormat": "Image Document",
   "image": {
    "contextLink": "http://en.wikipedia.org/wiki/Battle_of_Waterloo",
    "height": 846,
    "width": 1854,
    "byteSize": 3192839,
    "thumbnailLink": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9IeVkhBatTenB3pRnS8S3RhQqIXd946jJhaCjkgRYVQ4I0DbPIhLMmGE",
    "thumbnailHeight": 68,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Chattanooga - American Civil War - HISTORY.",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of Chattanooga - American Civil War - HISTORY.",
   "link": "http://cdn.history.com/sites/2/2013/11/Battle-of-Chattanooga-Hero-H.jpeg",
   "displayLink": "www.history.com",
   "snippet": "american civil war, battle of",
   "htmlSnippet": "american civil war, \u003cb\u003ebattle\u003c/b\u003e of",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://www.history.com/topics/american-civil-war/battle-of-chattanooga",
    "height": 454,
    "width": 1389,
    "byteSize": 739737,
    "thumbnailLink": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVe4n4ItggHBb7M-Bn6Rqoeu8OObQZ3wdfyLqTepDA2cJ4BMwk2ZIwkKA",
    "thumbnailHeight": 49,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Richard III - Tewkesbury",
   "htmlTitle": "Richard III - Tewkesbury",
   "link": "http://www.richard111.com/Battle%20of%20Tewkesbury.JPG",
   "displayLink": "www.richard111.com",
   "snippet": "May 4, 1471",
   "htmlSnippet": "May 4, 1471",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://www.richard111.com/tewkesbury1.htm",
    "height": 915,
    "width": 1524,
    "byteSize": 452972,
    "thumbnailLink": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRNxCOpSAja_UycDcW_FuPVeLzcq1QePOsb5IdFPHRsSKdFhwzxdc7i9TpU",
    "thumbnailHeight": 90,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Battle of Bosworth Field - Wikipedia, the free encyclopedia",
   "htmlTitle": "\u003cb\u003eBattle\u003c/b\u003e of Bosworth Field - Wikipedia, the free encyclopedia",
   "link": "http://upload.wikimedia.org/wikipedia/commons/1/11/Battle_of_Bosworth_Field_diorama.jpg",
   "displayLink": "en.wikipedia.org",
   "snippet": "Miniatures of knights, archers",
   "htmlSnippet": "Miniatures of knights, archers",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://en.wikipedia.org/wiki/Battle_of_Bosworth_Field",
    "height": 846,
    "width": 1280,
    "byteSize": 294121,
    "thumbnailLink": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRrSiSOvQ-TFH5d04pOBVa8gUv8nlIHpdL1P0Xw_-yie7UPuNEtgrph8Jo",
    "thumbnailHeight": 99,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "Spanish Succession : Battle of Ramillies",
   "htmlTitle": "Spanish Succession : \u003cb\u003eBattle\u003c/b\u003e of Ramillies",
   "link": "http://www.britishbattles.com/spanish-succession/ramillies/battle-ramilles-1200.jpg",
   "displayLink": "www.britishbattles.com",
   "snippet": "The Battle of Ramilles:",
   "htmlSnippet": "The \u003cb\u003eBattle\u003c/b\u003e of Ramilles:",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://www.britishbattles.com/spanish-succession/battle-ramillies.htm",
    "height": 911,
    "width": 1200,
    "byteSize": 289254,
    "thumbnailLink": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSfDvnLRVEm5NhCo08xGQ-VC2AduiOa4TS8wSoJIGl7YV9_x4YDfQN7W4Ux",
    "thumbnailHeight": 114,
    "thumbnailWidth": 150
   }
  },
  {
   "kind": "customsearch#result",
   "title": "File:Battle of Franklin, November 30, 1864.jpg - Wikimedia Commons",
   "htmlTitle": "File:\u003cb\u003eBattle\u003c/b\u003e of Franklin, November 30, 1864.jpg - Wikimedia Commons",
   "link": "http://upload.wikimedia.org/wikipedia/commons/6/6e/Battle_of_Franklin,_November_30,_1864.jpg",
   "displayLink": "commons.wikimedia.org",
   "snippet": "File:Battle of Franklin,",
   "htmlSnippet": "File:\u003cb\u003eBattle\u003c/b\u003e of Franklin,",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://commons.wikimedia.org/wiki/File:Battle_of_Franklin,_November_30,_1864.jpg",
    "height": 5149,
    "width": 7393,
    "byteSize": 9066133,
    "thumbnailLink": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4a_ZdPqAq7dG3QlCfcMg33C7L7brHjlqykLi3fjrle04uiC_MPLWj__4T",
    "thumbnailHeight": 104,
    "thumbnailWidth": 150
   }
  }
 ]
}
*/

var sizeOf = require('image-size');
var http = require('http');
var fs = require('fs');

function makeContainerObject() {
  return {
 "kind": "customsearch#search",
 "url": {
  "type": "application/json",
  "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&cref={cref?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&relatedSite={relatedSite?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
 },
 "queries": {
   /*
  "nextPage": [
   {
    "title": "Google Custom Search - \"battle",
    "totalResults": "162000000",
    "searchTerms": "\"battle",
    "count": 10,
    "startIndex": 11,
    "inputEncoding": "utf8",
    "outputEncoding": "utf8",
    "safe": "high",
    "cx": "010167764530769062315:196d4y__4ss",
    "searchType": "image"
   }
  ],
  */
  "request": [
   {
    "title": "Google Custom Search - \"battle",
    "totalResults": "162000000",
    "searchTerms": "\"battle",
    "count": 10,
    "startIndex": 1,
    "inputEncoding": "utf8",
    "outputEncoding": "utf8",
    "safe": "high",
    "cx": "010167764530769062315:196d4y__4ss",
    "searchType": "image"
   }
  ]
 },
 "context": {
  "title": "Content Push"
 },
 "searchInformation": {
  "searchTime": 0.314072,
  "formattedSearchTime": "0.31",
  "totalResults": "162000000",
  "formattedTotalResults": "162,000,000"
 },
 "items": [
 ]
};

}

function makeImageObject(imagePath) {
  var requestingImage = imagePath.indexOf('serveImages.js')!=-1;
  var dimensions = { height: 0, width: 0 };
  var fileSizeInBytes = 0;
  
  if (requestingImage) {
    var stats = fs.statSync(imagePath)
    fileSizeInBytes = stats["size"]
    dimensions = sizeOf(imagePath);
    imagePath = 'n/a';
  };

  return {
    // properties for images
   "kind": "customsearch#result",
   "title": "The Daily Battle - CrossFit LittletonCrossFit Littleton",
   "htmlTitle": "The Daily \u003cb\u003eBattle\u003c/b\u003e - CrossFit LittletonCrossFit Littleton",
   "link": "http://127.0.0.1:1337/"+imagePath,
   "displayLink": "crossfitlittleton.net",
   "snippet": "... Warrior and \"The Queen of Dreams\" when her Mother sadly passed away in \n2007, at her lowest ebb & feeling overwhelmed by such great losses and despair,\n ...",
   "htmlSnippet": "\u003cb\u003ebattle\u003c/b\u003e",
   "mime": "image/jpeg",
   "image": {
    "contextLink": "http://127.0.0.1:1337/"+imagePath,
    "height": dimensions.height,
    "width": dimensions.width,
    "byteSize": fileSizeInBytes,
    "thumbnailLink": "http://127.0.0.1:1337/"+imagePath,
    "thumbnailHeight": dimensions.height/10,
    "thumbnailWidth": dimensions.width/10,

   },

   // properties for articles - must be missing something, probably the container object is different too
   "pagemap": {
     "cse_image": [
       { "src": "http://127.0.0.1:1337/"+imagePath }
     ],
    "cse_thumbnail": [
     {
      "width": "240",
      "height": "169",
      "src": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQmfUs5VED7yKq2ZZafmE_J355PfLEDDrzBGbEVdv-yiL3Zz9avz7__70k"
     }
    ]
   },

  }
}

function makeHeader() {
  return {
'Content-Type': 'application/json; charset=UTF-8',
  };
}

fs.readdir('.',function(err, files) {
  files = files.filter(function(file) {
    return file.indexOf('serveImages.js')===-1;
  });

  http.createServer(function (req, res) {
    if (req.url.indexOf('key=')!=-1) {
      console.log('api request: ',
        (req.url.indexOf('searchType=image')<0)?'image':'article');
      res.writeHead(200, makeHeader());
      var retVal = makeContainerObject();
      for (var image=0; image<10; image++) {
        var imagePath = files[Math.floor(Math.random()*files.length)];
        retVal.items.push( makeImageObject(imagePath) );
      }

      res.write( JSON.stringify(retVal) );
      res.end();
    } else {
      var imageName = req.url.substring(1);
      console.log(imageName);
      var img = fs.readFileSync(imageName);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' } );
      res.write(img, 'binary');
      res.end();
    }
  }).listen(1337, '127.0.0.1');
  console.log('Server running at http://127.0.0.1:1337/');
});
