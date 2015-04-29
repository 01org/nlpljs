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
  /**
   * Filter which returns true if a value does not occur
   * in its comparisonValues array (using strict equality test).
   *
   * @param {array} comparisonValues Array of objects to compare
   * value under test against
   */
  var FilterDeduplicate = function (comparisonValues) {
    this.comparisonValues = comparisonValues || [];
  };

  /**
   * Add a value to the array of comparison values.
   *
   * NB this does not deduplicate, so it's best to do this after
   * testing a value.
   */
  FilterDeduplicate.prototype.addComparisonValue = function (value) {
    this.comparisonValues.push(value);
  };

  /**
   * Test the value of object[this.name] against same property
   * on an array of other objects.
   *
   * @param {object} value Value under test
   *
   * @returns {boolean} true if the value is unique among
   * the members of the array [obj].concat(comparisonValues)
   */
  FilterDeduplicate.prototype.test = function (value) {
    var passed = true;

    for (var i = 0; i < this.comparisonValues.length; i++) {
      if (this.comparisonValues[i] === value) {
        passed = false;
        break;
      }
    }

    return passed;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterDeduplicate;
  }
  else {
    window.FilterDeduplicate = FilterDeduplicate;
  }
})();
