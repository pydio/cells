module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

    grunt.initConfig({
        babel: {
            options: {
                optional:['es7.classProperties']
            },

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/react/',
                        src: ['**/*.js'],
                        dest: 'res/build/',
                        ext: '.js'
                    }
                ]
            }
        },
        browserify: {
            ui: {
                options: {
                    external:Externals,
                    browserifyOptions:{
                        standalone: 'ShareDialog',
                        debug:true
                    }
                },
                files: {
                    'res/build/ShareDialog.js': 'res/build/dialog/index.js'
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
                src: ['ShareDialog.js', 'ShareTemplates.js'],
                dest: 'res/build/',
                ext: '.js.gz'
            },
            css: {
                expand: true,
                cwd: 'res/',
                src: ['*.css'],
                dest: 'res/',
                ext: '.css.gz'
            }
        },
        watch: {
            js: {
                files: [
                    "res/react/**/*"
                ],
                tasks: ['babel', 'browserify', 'compress'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['babel', 'browserify', 'compress']);

};