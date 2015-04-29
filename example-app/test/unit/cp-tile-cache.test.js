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

var chai = require('chai');
chai.should();
var expect = chai.expect;
var TileCache = require('./../../app/content_push/cp-tile-cache');

// add a fake "setAttribute()" method to a fake tile object
var makeFakeTile = function (config) {
  config.setAttribute = function () {};
  return config;
};

describe('TileCache', function () {
  var filesOnlyFilter = function (tile) {
    return tile.type === 'file';
  };

  var imagesOnlyFilter = function (tile) {
    return tile.type === 'image';
  };

  var tileCache;

  beforeEach(function () {
    tileCache = new TileCache();
  });

  it('should return false if there are no tiles in the cache and the filter runs', function () {
    tileCache.runFilter().should.equal(false);

    tileCache.setFilter(filesOnlyFilter);
    tileCache.runFilter().should.equal(false);
  });

  it('should store tiles without running the filter and detect changes when filter runs', function () {
    var tile1 = makeFakeTile({ source: 'foo' });
    var tile2 = makeFakeTile({ source: 'bar' });

    tileCache.store(tile1);
    tileCache.store(tile2);

    tileCache.runFilter().should.equal(true);
    tileCache.getActiveTiles().should.eql([tile1, tile2]);
  });

  it('should cache a tile and return true if no filter is set', function () {
    var tile = makeFakeTile({ source: 'foo' });
    tileCache.cache(tile).should.equal(true);
  });

  it('should cache a tile and return true if filter is set and tile passes filter', function () {
    var tile = makeFakeTile({ source: 'foo', type: 'file' });
    tileCache.setFilter(filesOnlyFilter);
    tileCache.cache(tile).should.equal(true);
  });

  it('should cache a tile and return false if filter is set and tile fails filter', function () {
    var tile = makeFakeTile({ source: 'foo', type: 'image' });
    tileCache.setFilter(filesOnlyFilter);
    tileCache.cache(tile).should.equal(false);
  });

  it('should return an array of active tiles', function () {
    var tile1 = makeFakeTile({ source: 'foo', type: 'image' });
    var tile2 = makeFakeTile({ source: 'bar', type: 'file' });
    var tile3 = makeFakeTile({ source: 'baz', type: 'file' });

    var expected = [tile2, tile3];

    tileCache.setFilter(filesOnlyFilter);

    tileCache.cache(tile1);
    tileCache.cache(tile2);
    tileCache.cache(tile3);

    var actual = tileCache.getActiveTiles();

    actual.should.eql(expected);

    tileCache.getActiveTilesCount().should.equal(expected.length);
  });

  it('should return a tile by source', function () {
    var tile = makeFakeTile({ source: 'foo', type: 'image' });
    tileCache.cache(tile);
    tileCache.getTileBySource('foo').should.equal(tile);
  });

  it('should return the active/inactive status of a tile', function () {
    var tile1 = makeFakeTile({ source: 'foo', type: 'image' });
    var tile2 = makeFakeTile({ source: 'bar', type: 'file' });

    tileCache.setFilter(filesOnlyFilter);

    tileCache.cache(tile1);
    tileCache.cache(tile2);

    tileCache.isActive('foo').should.equal(false);
    tileCache.isActive('bar').should.equal(true);
  });

  it('should deactivate a tile if the filter changes and tile fails the filter', function () {
    var tile = makeFakeTile({ source: 'foo', type: 'image' });

    tileCache.cache(tile);

    tileCache.setFilter(filesOnlyFilter);
    tileCache.isActive('foo').should.equal(false);

    tileCache.setFilter(imagesOnlyFilter);
    tileCache.isActive('foo').should.equal(true);
  });
});
