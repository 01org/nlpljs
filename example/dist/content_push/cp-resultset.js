(function () {
  /* representation of the results for a single query */
  var ResultSet = function (query) {
    /* the key phrase these results relate to */
    this.query = query;

    /* cursor position inside the result set to retrieve from next */
    this.cursor = 0;

    /* offset for next search for this query */
    this.offset = 0;

    /* set to true if no more results are available for this query */
    this.isExhausted = false;

    /* the actual results; each is an object with a src property
       representing an image URL */
    this.results = [];
  };

  /**
   * Get a batch of results; sets the cursor so that
   * the next call to fetch gets the following batch of results.
   *
   * If numResults is not set, returns all the results from the
   * cursor to the end of the result set.
   *
   * If there are no more results, this returns an empty array.
   */
  ResultSet.prototype.fetch = function (numResults) {
    var maxResults = this.results.length - this.cursor;

    if (numResults) {
      numResults = Math.min(numResults, maxResults);
    } else {
      numResults = maxResults;
    }

    var batch = this.results.slice(this.cursor, this.cursor + numResults);

    this.cursor = Math.min(
      this.cursor + numResults,
      this.results.length
    );

    return batch;
  };

  // add array of new results or single new result to the result set
  ResultSet.prototype.add = function (results) {
    if (results instanceof Array) {
      this.results = this.results.concat(results);
    }
    else {
      this.results.push(results);
    }

  };

  // returns the number of results which can still be fetched
  ResultSet.prototype.count = function () {
    return this.results.slice(this.cursor).length;
  };

  // set the offset to the specified position
  ResultSet.prototype.setOffset = function (pos) {
    this.offset = pos;
  };

  /* mark resultset as not being able to yield more results */
  ResultSet.prototype.setExhausted = function () {
    this.isExhausted = true;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultSet;
  }
  else {
    window.ResultSet = ResultSet;
  }
})();
