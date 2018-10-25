module.exports = function(grunt) {

    const {Externals} = require('../libdefs.js');

    grunt.initConfig({
        babel: {
            options: {
                "plugins": ["transform-react-jsx"],
                "presets":["env"],
                "comments": false
            },
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
            view : {
                options: {
                    external: Externals,
                    browserifyOptions:{
                        standalone: 'UploaderView',
                        debug: true
                    }
                },
                files: {
                    'js/build/UploaderView.js':'js/build/view/index.js'
                }
            },
            model : {
                options: {
                    external: Externals,
                    browserifyOptions:{
                        standalone: 'UploaderModel',
                        debug: true
                    }
                },
                files: {
                    'js/build/UploaderModel.js':'js/build/model/index.js'
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
                cwd: 'js/build/',
                src: ['*.js'],
                dest: 'js/build/',
                ext: '.js.gz'
            },
        },
        watch: {
            js: {
                files: [
                    "js/react/**/*"
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
