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

'use strict';

var path = require('path');

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var config = {
    app: 'app',
    dist: 'dist',
    libnlp: path.join(__dirname, '..', 'src')
  };

  var lintOptions = {
    camelcase: false,
    curly: true,
    eqeqeq: true,
    forin: true,
    immed: true,
    indent: 2,
    noempty: true,
    quotmark: 'single',

    undef: true,

    // words which are allowed globally (or not)
    globals: {
      console: false,
      Polymer: false,
      chrome: false,
      Formatter: false, /* app/content_push/cp-formatter.js */
      CP_CONSTANTS: false, /* app/content_push/cp-constants.js */
      FilterDeduplicate: false, /* app/content_push/cp-filter-deduplicate.js */
      _: false, /* app/bower_components/lodash/ */
    },

    unused: true,
    browser: true,
    strict: true,
    trailing: true,
    maxdepth: 7,
    newcap: false // otherwise factory functions throw errors
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    clean: [ config.dist ],

    // grunt-mochaccino options; runs the tests in the test/unit
    // directory on the command line (rather than in a browser)
    mochaccino: {
      all: {
        files: [
          { src: 'test/unit/*.test.js' }
        ]
      }
    },

    // custom element linting
    inlinelint: {
      all: ['app/content_push/**/*.html'],

      // see http://jshint.com/docs/
      options: lintOptions
    },

    // pure js linting
    jshint: {
      all: [
        'app/worker/*.js',
        'app/event_page/*.js',
        'app/content_push/*.js',
        'app/content_script/*.js'
      ],

      // see http://jshint.com/docs/
      options: lintOptions
    },

    copy: {
      // Copies all files into dist directory
      build: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: config.app,
            dest: config.dist,
            src: [ '**' ]
          },

          {
            expand: true,
            dot: true,
            cwd: config.libnlp,
            dest: path.join(config.dist, 'libnlp'),
            src: [ '**' ]
          }
        ]


      }
    }
  });

  grunt.registerTask('test', ['mochaccino:all']);

  grunt.registerTask('dist', ['copy:build']);

  grunt.registerTask('default', [
    'clean',
    'test',
    'dist'
  ]);
};
