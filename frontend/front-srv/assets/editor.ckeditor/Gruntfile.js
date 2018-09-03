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
                        dest: 'res/build/PydioCKEditor/',
                        ext: '.js'
                    }
                ]
            }
        },
        browserify: {
            ui : {
                options: {
                    external:Externals,
                    browserifyOptions:{
                        debug:true,
                        standalone: 'PydioCKEditor'
                    }
                },
                files: {
                    'res/build/PydioCKEditor.js':'res/build/PydioCKEditor/index.js'
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
                src: ['PydioCKEditor.js'],
                dest: 'res/build/',
                ext: '.js.gz'
            },
        },
        copy: {
            ckeditor: {
                expand: true,
                cwd: 'node_modules/ckeditor/',
                src: '**/*',
                dest: './res/build/ckeditor',
                flatten:false
            }
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['babel', 'browserify:ui', 'copy', 'compress']);

};
