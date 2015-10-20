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

(function (_) {
  'use strict';

  // returns true if arr1 and arr2 contain the same elements
  var same = function (arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  };

  // return the elements which are common to all arrays passed as arguments;
  // e.g. intersect([ [ 3, 4 ] ], [ [ 2, 3 ], [ 3, 4 ] ], [ [ 3, 4 ], [ 4, 5 ] ])
  // returns [ [ 3, 4 ] ]
  // arrays: an array of arrays, as exemplified above
  var intersect = function (arrays) {
    var head = arrays[0];
    var tail = arrays.slice(1);

    // the memo is the array of common elements so far
    return _.reduce(tail, function (memo, arr) {
      var newMemo = [];

      _.each(memo, function (memoItem) {
        _.each(arr, function (arrItem) {
          if (same(memoItem, arrItem)) {
            newMemo.push(arrItem);
          }
        });
      });

      return newMemo;
    }, head);
  };

  /*
   * Find the difference between array arr1 and array arr2. Any elements
   * which are in arr2 but not in arr1 are returned as the result. If arr1
   * includes elements which are not in arr2, these are ignored.
   *
   * Each element of arr2 is compared with each element of arr1 using
   * fn, which has this signature: fn(elt_from_arr1, elt_from_arr2);
   * if this function returns false for elt_from_arr2 for all
   * elements from arr1, elt_from_arr2 is included in the output
   * array.
   */
  var diff = function (arr1, arr2, fn) {
    return _.reduce(arr2, function (memo, elt_from_arr2) {
      var test = function (elt_from_arr1) {
        return fn(elt_from_arr1, elt_from_arr2);
      };

      var exists = _.find(arr1, test);

      if (!exists) {
        memo.push(elt_from_arr2);
      }

      return memo;
    }, []);
  };

  var ArrayUtils = {
    same: same,
    intersect: intersect,
    diff: diff
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArrayUtils;
  }
  else {
    window.ArrayUtils = ArrayUtils;
  }
})(
  typeof _ === 'undefined' ? require('../bower_components/lodash/dist/lodash') : _
);
