/* Class for receiving new keywords and deciding which of them
   should be "active", depending on keywords already gathered,
   existing results, slider position etc. */

(function () {
  /* maximum number of keywords to consider each time NLP
     finishes parsing the current context */
  var MAX_KEYWORDS = 5;

  var KeywordSelector = function (ArrayUtils) {
    this.ArrayUtils = ArrayUtils;

    /* array of all keywords extracted from the document so far;
       each keyword has this format:
       {
         text: "keyword text",
         score: 1.66,
         groupId: 10
       }
    */
    this.keywords = [];

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
    var numActiveKeywords = this.activeKeywords.length;
    var numToReturn = 1 + parseInt((numActiveKeywords - 1) * this.width, 10);
    return this.activeKeywords.slice(0, numToReturn);
  };

  /* sets the active keywords; NB any keywords set
     here are also added to the array of all keywords in the document;
     returns an array of the keywords from the array <keywords>
     which were not in the existing activeKeywords array;
     we currently just keep the first 5 keywords for consideration */
  KeywordSelector.prototype.setActiveKeywords = function (keywords) {
    var keywordsToUse = keywords.slice(0, MAX_KEYWORDS);
    var newKeywords = this.checkKeywordInfoChanged(keywordsToUse);
    this.keywords = this.keywords.concat(keywords);
    this.activeKeywords = keywordsToUse;
    return newKeywords;
  };

  KeywordSelector.prototype.setWidth = function (width) {
    this.width = width;
  };

  /* TODO fire an event when the current keywords changed rather
   * than having to manually test whether they have
   *
   * tests whether the current keywords have changed
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
