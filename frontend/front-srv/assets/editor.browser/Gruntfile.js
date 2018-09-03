module.exports = function(grunt) {

    const {Externals} = require('../libdefs.js');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build',
                        ext: '.babel.js'
                    }
                ]
            }
        },
        browserify: {
            ui : {
                options: {
                    external:Externals,
                    browserifyOptions:{
                        debug:true
                    }
                },
                files: {
                    'res/build/PydioBrowserEditor.js':'res/build/PydioBrowserEditor.babel.js',
                    'res/build/PydioBrowserActions.js':'res/build/PydioBrowserActions.babel.js'
                }
            }
        },
        compress: {
            options: {
                mode: 'gzip',
                level:9,
            },
            js: {
                expand: true,
                cwd: 'res/build/',
                src: ['PydioBrowserEditor.js', 'PydioBrowserActions.js'],
                dest: 'res/build/',
                ext: '.js.gz'
            },
        },
        watch: {
            js: {
                files: [
                    "res/**/*"
                ],
                tasks: ['babel', 'browserify:ui', 'compress'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['babel', 'browserify:ui', 'compress']);

};
