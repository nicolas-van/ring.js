module.exports = function(grunt) {

    var pack = require("./package.json");

    grunt.initConfig({
        jshint: {
            files: ['ring.js', 'test.js'],
            options: {
                es3: true, // ie 7 compatibility
                eqeqeq: true, // no == or !=
                immed: true, // forces () around directly called functions
                forin: true, // makes it harder to use for in
                latedef: "nofunc", // makes it impossible to use a variable before it is declared
                newcap: true, // force capitalized constructors
                strict: true, // enforce strict mode
                trailing: true, // trailing whitespaces are ugly
                maxlen: 120, // maximum characters per line
                camelcase: true, // force camelCase
            },
        },
        mocha: {
            browser: {
                src: ['test.html'],
                options: {
                    log: true,
                    reporter: "Nyan",
                    run: true,
                },
            }
        },
        mochaTest: {
            node: {
                src: ['test.js'],
                options: {
                    ui: "qunit",
                }
            }
        },
        compress: {
            main: {
                options: {
                  archive: pack.name + "-" + pack.version + ".zip",
                },
                files: [
                    {src: 'ring.js', dest: '.'},
                    {expand: true, flatten: true, src: 'bower_components/lodash/lodash.js', dest: '.'},
                    {src: 'README', dest: '.'},
                    {src: 'package.json', dest: '.'},
                ],
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('test', ['jshint', "mocha", "mochaTest"]);

    grunt.registerTask('dist', ['compress']);

    grunt.registerTask('default', ['test']);

};
