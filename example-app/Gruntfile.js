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
