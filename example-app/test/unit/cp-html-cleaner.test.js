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

require('chai').should();

var HtmlCleaner = require('./../../app/content_push/cp-html-cleaner');

describe('HtmlCleaner', function () {
  it('should set defaults in constructor', function () {
    var cleaner = new HtmlCleaner();
    cleaner.stripElements.should.eql([]);
    cleaner.stripTags.should.eql([]);
  });

  it('should allow defaults to be overridden in constructor', function () {
    var cleaner = new HtmlCleaner({stripElements: ['img'], stripTags: ['a']});
    cleaner.stripElements.should.eql(['img']);
    cleaner.stripTags.should.eql(['a']);
  });

  it('should remove tags while retaining their text', function () {
    var cleaner = new HtmlCleaner({
      stripElements: ['sup', 'img'],
      stripTags: ['a', 'b']
    });

    var input = '<a href="http://bogus.com/>bogus website</a> is <b>not</b> a ' +
                '<a href="wikipedia.org">great <b>place</b></a> to visit';

    var expected = 'bogus website is not a great place to visit';

    var actual = cleaner.clean(input);

    actual.should.equal(expected);
  });

  it('should remove all tags if config.stripTags is "*"', function () {
    var cleaner = new HtmlCleaner({stripElements: [], stripTags: '*'});

    var input = '<div><p><a href="http://bogus.com/>bogus ' +
                '<em>website</em></a> is <b>not</b> a ' +
                '<a href="wikipedia.org">great <b>place</b></a> to ' +
                'visit</p></div>';

    var expected = 'bogus website is not a great place to visit';

    var actual = cleaner.clean(input);

    actual.should.equal(expected);
  });

  it('should clean up whitespace', function () {
    var cleaner = new HtmlCleaner();
    var input = "hello there\n\tand now this\n\n\n\t time it's personal\n";
    var expected = 'hello thereand now this time it\'s personal';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove trailing and leading whitespace', function () {
    var cleaner = new HtmlCleaner();
    var input = "   hello there     ";
    var expected = 'hello there';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove elements with start and end tags', function () {
    var cleaner = new HtmlCleaner({
      stripElements: ['sup', 'img'],
      stripTags: []
    });

    var input = 'hello there <sup>some spurious gunk</sup> ' +
                'and <sup id="class">some more junk</sup> now this';
    var expected = 'hello there and now this';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove elements without end tags', function () {
    var cleaner = new HtmlCleaner({
      stripElements: ['sup', 'img'],
      stripTags: []
    });

    var input = "hello <img src='image.jpg'/> dolly";
    var expected = 'hello dolly';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove elements and their content', function () {
    var cleaner = new HtmlCleaner({stripElements: ['p'], stripTags: []});
    var input = "<p>hello <img src='image.jpg'/> dolly</p><div>not " +
                "a paragraph</div>";
    var expected = '<div>not a paragraph</div>';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove all elements if "*" used in config.stripElements', function () {
    var cleaner = new HtmlCleaner({stripElements: '*', stripTags: []});

    var input = "<bogus>and <em>tag</em> then <img    /></bogus> and then some " +
                "<img src='never.jpg'/> images <p/> empty para and " +
                "<em>stuff</em> this doesn't have <wuha>a tag at the</wuha> " +
                "<em>beginning</em> or end";

    var expected = 'and then some images empty para and this doesn\'t have or end';

    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should remove all tags if "*" used in config.stripTags', function () {
    var cleaner = new HtmlCleaner({stripTags: '*', stripElements: []});

    var input = "<bogus>and <em>tag</em> then <img    /></bogus> and then some " +
                "<img src='never.jpg'/> images <p/> empty para and " +
                "<em>stuff</em> this doesn't have <wuha>a tag at the</wuha> " +
                "<em>beginning</em> or end";

    var expected = "and tag then and then some " +
                   "images empty para and " +
                   "stuff this doesn't have a tag at the " +
                   "beginning or end";

    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });

  it('should cope with spurious whitespace in tags', function () {
    var cleaner = new HtmlCleaner({stripElements: ['sup', 'img'], stripTags: []});
    var input = "hello <img    src='image.jpg'    /> dolly";
    var expected = 'hello dolly';
    var actual = cleaner.clean(input);
    actual.should.equal(expected);
  });
});
