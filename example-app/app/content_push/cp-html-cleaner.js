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

  /**
   * @class HtmlCleaner
   *
   * @classdesc Object for cleaning up HTML. Removes elements and tags
   * according to configuration, as well as cleaning up whitespace
   * (tabs, newlines, multiple spaces, trailing and leading whitespace).
   *
   * @param {object} config
   * @param {string[]} config.stripElements Elements to remove; NB
   * their content is also removed; e.g. ['sup', 'blink']
   * @param {string[]} config.stripTags Tags to remove, leaving content
   * behind; e.g. ['p', 'span']
   */
  var HtmlCleaner = function (config) {
    config = config || {};
    _.defaults(config, {stripElements: [], stripTags: []});
    _.extend(this, config);
  };

  /**
   * Filter HTML, removing elements and tags according to
   * configuration.
   *
   * @name HtmlCleaner#clean
   * @method
   * @param {string} html String of HTML to filter
   * @returns {string} Filtered HTML
   */
  HtmlCleaner.prototype.clean = function (html) {
    var pattern, regex, stripElements, stripTags;

    stripElements = this.stripElements;
    stripTags = this.stripTags;

    // remove elements and their content
    if (stripElements === '*') {
      stripElements = ['[^<>]+?'];
    }

    _.each(stripElements, function (stripElement) {
      // elements with content
      pattern = '<(' + stripElement + ')[^>]*>.*?<\/[^>]*\\1>';
      regex = new RegExp(pattern, 'g');

      html = html.replace(regex, '');

      // elements without content
      pattern = '<' + stripElement + '[^>]*?\/>';
      regex = new RegExp(pattern, 'g');

      html = html.replace(regex, '');
    });

    // strip tags, retaining any inner content
    if (stripTags === '*') {
      stripTags = ['[^<>]+?'];
    }

    _.each(stripTags, function (stripTag) {
      pattern = '<\/?' + stripTag + '[^<>]*?\/?>';
      regex = new RegExp(pattern, 'g');

      html = html.replace(regex, '');
    });

    // clean up whitespace
    html = html.replace(/[\n\t]+/g, '');
    html = html.replace(/ {2,}/g, ' ');

    // trim trailing and leading whitespace
    html = html.replace(/^\s+/, '');
    html = html.replace(/\s+$/, '');

    return html;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HtmlCleaner;
  } else {
    window.HtmlCleaner = HtmlCleaner;
  }
})(
  typeof _ === 'undefined' ? require('../bower_components/lodash/dist/lodash') : _
);
