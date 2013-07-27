module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['ring.js'],
    },
    qunit: {
      files: ['test.html'],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('test', ['jshint', "qunit"]);

  grunt.registerTask('default', ['test']);

};