module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['ring.js'],
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['test']);

};