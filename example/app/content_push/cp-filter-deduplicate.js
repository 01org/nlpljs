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
