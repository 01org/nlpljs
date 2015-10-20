/*
 * Natural Language Processing Library for JavaScript
 *
 * A client-side NLP utility library for web applications
 *
 * Copyright 2015 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Authors:
 *   Elliot Smith <elliot.smith@intel.com>
 *   Max Waterman <max.waterman@intel.com>
 *   Plamena Manolova <plamena.manolova@intel.com>
 */

(function () {
  'use strict';

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
