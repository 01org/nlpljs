module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-mochaccino');

  grunt.initConfig({
    mochaccino: {
      all: {
        files: [
          { src: 'test/unit/*.test.js' }
        ]
      }
    }
  });

  grunt.registerTask('test', ['mochaccino:all']);
};
