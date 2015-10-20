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


/**
 * Store for tiles which can be queried to get the set which
 * should be currently active.
 *
 * As a minimum, a tile needs this structure to work with the TileCache:
 * { source: <unique ID for tile> }
 * source will usually be a URI but doesn't have to be
 * A tile should also have a setAttribute() method.
 */
(function (_) {
  'use strict';

  var TileCache = function () {
    /* keyed by tile source; stores Tile instances */
    this.tiles = {};

    /* keyed by tile source; maps to true/false depending
       on whether the current filter returns true for the tile */
    this.tilesActive = {};

    /* this is set to the real filter as the user selects tile
       type, keywords change, enabled sources change etc. */
    this.filter = function (/*tile*/) {
      return true;
    };
  };

  /**
   * Add a tile to the cache. The current filter is applied to the
   * tile to determine whether it is active. This returns an object
   * with the same structure as the runFilter() method, so that
   * the caller can determine whether the new tile caused a change
   * in the active tile set.
   */
  TileCache.prototype.cache = function (tile) {
    console.log('CP-TILE-CACHE: caching tile', tile);
    this.store(tile);
    return this.runFilter();
  };

  /**
   * Store a tile in the cache without running filters on it (useful
   * where we already know that a tile is inactive).
   */
  TileCache.prototype.store = function (tile) {
    this.tiles[tile.source] = tile;
  };

  /**
   * Get all active tiles as an array.
   */
  TileCache.prototype.getActiveTiles = function () {
    var self = this;
    return _.select(this.tiles, function (tile) {
      return self.tilesActive[tile.source];
    });
  };

  /**
   * Get a count of the active tiles.
   */
  TileCache.prototype.getActiveTilesCount = function () {
    return this.getActiveTiles().length;
  };

  /**
   * Search for a tile with "source" attribute set to value;
   * returns the found tile; or if not found, returns null.
   */
  TileCache.prototype.getTileBySource = function (source) {
    return this.tiles[source] || null;
  };

  /**
   * filter is a function with signature filter(tile), which returns
   * true if the file should be active and false otherwise
   *
   * returns true if the filter caused the active file set to change,
   * false otherwise
   */
  TileCache.prototype.setFilter = function (filter) {
    console.log('CP-TILE-CACHE:setFilter()');
    this.filter = filter;
    return this.runFilter();
  };

  /**
   * Returns true if the tile referred to by the unique ID source is
   * active, false otherwise
   */
  TileCache.prototype.isActive = function (source) {
    return !!this.tilesActive[source];
  };

  /**
   * Run the filter across the current tiles.
   *
   * returns true if the set of active tiles changed; false otherwise
   */
  TileCache.prototype.runFilter = function () {
    var self = this;

    var activeTilesChanged = false;
    var activeBeforeFiltering;
    var activeAfterFiltering;

    _.map(this.tiles, function (tile) {
      activeBeforeFiltering = !!self.tilesActive[tile.source];

      if (self.filter(tile)) {
        activeAfterFiltering = true;
      } else {
        activeAfterFiltering = false;
      }

      tile.setAttribute('data-active', activeAfterFiltering);

      self.tilesActive[tile.source] = activeAfterFiltering;

      if (activeBeforeFiltering !== activeAfterFiltering) {
        activeTilesChanged = true;
      }
    });

    console.log('CP-TILE-CACHE: active tiles changed? ' + activeTilesChanged);

    return activeTilesChanged;
  };

  /* export */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TileCache;
  }
  else {
    window.TileCache = TileCache;
  }
})(typeof _ === 'undefined' ? require('../bower_components/lodash/dist/lodash.js') : _);
