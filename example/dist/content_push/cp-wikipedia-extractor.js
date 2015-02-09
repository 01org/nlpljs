(function (_, HtmlCleaner) {
  var chunkRegexes = [
    /<p[\s\S]*?>([\s\S]+?)<\/p>/gm,
    /<div[\s\S]*?>([\s\S]+?)<\/div>/gm
  ];
  var imageRegex = /<img.+?>/g;
  var imageWidthRegex = /width=[\'"](\d+)/;
  var imageHeightRegex = /height=[\'"](\d+)/;
  var imageSourceRegex = /src=[\'"](.+?)[\'"]/;
  var httpRegex = /^http:/;

  /* return chunks matching regex; regex should have a capturing
     pattern in it (see chunkRegexes for examples) */
  var matchRegex = function (html, regex) {
    var matches;
    var chunks = [];

    while (matches = regex.exec(html)) {
      chunks.push(matches[1]);
    }

    return chunks;
  };

  /* parse out first two paras or divs;
     unfortunately, Wikipedia's HTML is so variable in quality
     that it won't work with a DOM parser */
  var getText = function (html, cleaner, numChunks) {
    html = html.replace('\n', '');

    var chunks = [];
    var newChunks;
    for (var i = 0; i < chunkRegexes.length; i++) {
      newChunks = matchRegex(html, chunkRegexes[i]);
      chunks = chunks.concat(newChunks);

      if (chunks.length >= numChunks) {
        chunks = chunks.slice(0, numChunks);
        break;
      }
    }

    return _.map(chunks, cleaner.clean);
  };

  var getImages = function (html, minImageSide, numImages) {
    var imgs = imageRegex.exec(html);

    /* no images */
    if (!imgs) {
      return [];
    }

    var usableImages = [];
    var img;
    var width;
    var height;
    var widthMatches;
    var heightMatches;
    var src;
    var srcMatches;

    for (var i = 0; i < imgs.length; i++) {
      img = imgs[i];

      /* prevent image from being used unless width and height are set
         in the img HTML declaration */
      width = minImageSide - 1;
      height = minImageSide - 1;

      widthMatches = imageWidthRegex.exec(img) || [];
      if (widthMatches[1]) {
        width = parseInt(widthMatches[1]);
      }

      heightMatches = imageHeightRegex.exec(img) || [];
      if (heightMatches[1]) {
        height = parseInt(heightMatches[1]);
      }

      if (height >= minImageSide && width >= minImageSide) {
        var srcMatches = imageSourceRegex.exec(img) || [];

        if (srcMatches) {
          src = srcMatches[1];

          /* Wikipedia images sometimes have the scheme missing
             from the front of the URI */
          if (!httpRegex.exec(src)) {
            src = 'http:' + src;
          }

          usableImages.push(src);
        }
      }

      /* we need a maximum of numImages images */
      if (usableImages.length === numImages) {
        break;
      }
    }

    return usableImages;
  };

  /**
   * Class to extract HTML chunks and images from Wikipedia article HTML.
   * By default, extracts the first two paragraphs or the first
   * paragraph and first <ul> list, plus one image URL.
   *
   * @returns Page object with format
   * {
   *   text: ['<p>first para</p>', '<p>second para</p>'],
   *   images: ['http://image.url']
   * }
   */
  var WikipediaExtractor = function (config) {
    config = config || {};

    this.cleaner = config.cleaner || new HtmlCleaner({
      stripElements: ['sup', 'img'],
      stripTags: ['a']
    });

    this.minImageSide = config.minImageSide || 200;

    this.numChunks = config.numChunks || 2;

    this.numImages = config.numImages || 1;
  };

  WikipediaExtractor.prototype.parse = function (html) {
    var text = getText(html, this.cleaner, this.numChunks);
    var images = getImages(html, this.minImageSide, this.numImages);

    return {
      'text': text,
      'images': images
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WikipediaExtractor;
  } else {
    window.WikipediaExtractor = WikipediaExtractor;
  }
})(
  typeof _ === 'undefined' ? require('../bower_components/lodash/dist/lodash') : _,
  typeof HtmlCleaner === 'undefined' ? require('./cp-html-cleaner') : HtmlCleaner
);
