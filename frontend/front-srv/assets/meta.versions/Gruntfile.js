module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build/PydioVersioning',
                        ext: '.js'
                    }
                ]
            }
        },
        browserify: {
            ui : {
                options: {
                    external: Externals,
                    browserifyOptions:{
                        standalone: 'PydioVersioning',
                        debug: true
                    }
                },
                files: {
                    'res/build/PydioVersioning.js':'res/build/PydioVersioning/index.js'
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
                src: ['*.js'],
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
