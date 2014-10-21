var chai = require('chai');
chai.should();
var expect = chai.expect;
var FilterDeduplicate = require('./../../app/content-push/cp-filter-deduplicate');

describe('FilterDeduplicate', function () {

  var filter;

  beforeEach(function () {
    filter = new FilterDeduplicate();
  });

  it('should deduplicate values', function () {
    filter.test('foo').should.equal(true);
    filter.addComparisonValue('foo');

    /* second time round, duplicate is rejected */
    filter.test('foo').should.equal(false);
  });

});
