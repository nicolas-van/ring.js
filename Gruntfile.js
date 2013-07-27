module.exports = function(grunt) {

    var pack = require("./package.json");

    grunt.initConfig({
        jshint: {
            files: ['ring.js'],
        },
        qunit: {
            files: ['test.html'],
        },
        compress: {
            main: {
                options: {
                  archive: pack.name + "-" + pack.version + ".zip",
                },
                files: [
                    {src: 'ring.js', dest: '.'},
                    {expand: true, flatten: true, src: 'bower_components/underscore/underscore.js', dest: '.'},
                    {src: 'README', dest: '.'},
                    {src: 'package.json', dest: '.'},
                ],
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('test', ['jshint', "qunit"]);

    grunt.registerTask('dist', ['compress']);

    grunt.registerTask('default', ['test']);

};
