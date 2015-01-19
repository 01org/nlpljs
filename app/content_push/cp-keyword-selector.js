/* Class for receiving new keywords and deciding which of them
   should be "active", depending on keywords already gathered,
   existing results, slider position etc. */

(function () {
  /* maximum number of keywords to consider each time NLP
     finishes parsing the current context */
  var MAX_KEYWORDS = 5;

  var KeywordSelector = function (ArrayUtils) {
    this.ArrayUtils = ArrayUtils;

    /* hash of all keywords extracted from the document so far
       with this format:
       {
         "keyword text": [
           {
             text: "keyword text",
             score: 1.66,
             groupId: 10
           },
           {
             text: "keyword text",
             score: 1.2,
             groupId: 11
           }
         ],
         ...
       }

    */
    this.keywords = {};

    /* array of keywords associated with the currently-visible part
       of the document; NB the current keywords are the subset of
       the active keywords which are selected according to the
       algorithm in getCurrentKeywords() */
    this.activeKeywords = [];

    /* "width" across the set of current active keywords; this
       decides which of the active keywords are returned as
       the "current" keywords  */
    this.width = 0;
  };

  /* get the active keywords narrowed to the current "width" */
  KeywordSelector.prototype.getCurrentKeywords = function () {
    return this.sliceKeywords(this.activeKeywords);
  };

  /* add keywords to the hash */
  KeywordSelector.prototype.storeKeywords = function (keywords) {
    var keytext;
    for (var i = 0; i < keywords.length; i++) {
      keytext = keywords[i].text;
      if (!this.keywords[keytext]) {
        this.keywords[keytext] = [];
      }

      this.keywords[keytext].push(keywords[i]);
    }
  };

  /* get a slice from an array of keywords depending on the current
     width */
  KeywordSelector.prototype.sliceKeywords = function (keywords) {
    var numKeywords = keywords.length;
    var numToReturn = 1 + parseInt((numKeywords - 1) * this.width, 10);
    return keywords.slice(0, numToReturn);
  };

  /* sets the active keywords; NB any keywords set
     here are also added to the array of all keywords in the document;
     returns an array of the keywords from the array <keywords>
     which were not in the existing activeKeywords array;
     we currently just keep the first 5 keywords for consideration */
  KeywordSelector.prototype.setActiveKeywords = function (keywords) {
    var keywordsToUse = keywords.slice(0, MAX_KEYWORDS);
    var newKeywords = this.checkKeywordInfoChanged(keywordsToUse);
    this.storeKeywords(keywords);
    this.activeKeywords = keywordsToUse;
    return newKeywords;
  };

  KeywordSelector.prototype.setWidth = function (width) {
    this.width = width;
  };

  /* TODO fire an event when the active keywords changed rather
   * than having to manually test whether they have
   *
   * tests whether the current keywords have changed;
   * NB newKeywords is sliced the same as current keywords,
   * and only the selected top N keywords are tested (based on width)
   *
   * returns an array of new keywords in the same format as
   * this.activeKeywords
   */
  KeywordSelector.prototype.checkKeywordInfoChanged = function (newKeywords) {
    var currentKeywords = this.getCurrentKeywords();

    /* no keywords yet, so definitely a change */
    if (newKeywords.length && !currentKeywords.length) {
      return newKeywords;
    } else {
      return this.ArrayUtils.diff(currentKeywords, newKeywords, function (elt1, elt2) {
        return elt1.text === elt2.text;
      });
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeywordSelector;
  }
  else {
    window.KeywordSelector = KeywordSelector;
  }
})();
