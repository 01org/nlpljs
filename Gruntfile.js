module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-mochaccino');

  grunt.initConfig({
    mochaccino: {
      all: {
        files: [
          { src: 'test/unit/*.test.js' }
        ],
        reporter: 'dot',
      },

      cov: {
        files: [
          { src: 'test/unit/*.test.js' }
        ],
        reporter: 'html-cov',
        reportDir: 'build'
      }
    }
  });

  grunt.registerTask('test', ['mochaccino:all']);
  grunt.registerTask('cov', ['mochaccino:cov']);
};
