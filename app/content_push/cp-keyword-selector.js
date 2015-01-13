/* Class for receiving new keywords and deciding which of them
   should be "active", depending on keywords already gathered,
   existing results, slider position etc. */

(function () {
  /* maximum number of keywords to consider each time NLP
     finishes parsing the current context */
  var MAX_KEYWORDS = 5;

  var KeywordSelector = function (ArrayUtils) {
    this.ArrayUtils = ArrayUtils;

    /* array of all keywords extracted from the document so far */
    this.keywords = [];

    /* array of keywords associated with the currently-visible part
       of the document */
    this.activeKeywords = [];

    /* "width" across the set of current active keywords; this
       decides which of the active keywords are returned as
       the "current" keywords  */
    this.width = 0.5;
  };

  /*
   * get the active keywords narrowed to the current "width"
   * TODO we're currently just returning all the active keywords,
   * but what we really want to do is return the
   * set of active keywords which are currently under consideration
   * (according to the setting on the slider)
   */
  KeywordSelector.prototype.getCurrentKeywords = function () {
    return this.activeKeywords;
  };

  /* sets the active keywords; NB any keywords set
     here are also added to the array of all keywords in the document;
     returns an array of the keywords from the array <keywords>
     which were not in the existing active keywords array;
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
   * oldKeywords and newKeywords have this format:
   * [
   *   {
   *     text: "keyword text",
   *     score: 1.66,
   *     groupId: 10
   *   },
   *   ...
   * ]
   *
   * returns an array of new keywords in the same format as the input
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
