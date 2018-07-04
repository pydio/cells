module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'js/react/',
                        src: ['**/*.js'],
                        dest: 'js/build/',
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
                        standalone: 'ReactMeta',
                        debug: true
                    }
                },
                files: {
                    'js/build/ReactMeta.js':'js/build/index.js'
                }
            }
        },
        watch: {
            js: {
                files: [
                    "js/react/**/*"
                ],
                tasks: ['babel', 'browserify'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['babel', 'browserify']);

};
