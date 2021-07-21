module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs');

    grunt.initConfig({
        babel: {
            options: {
                plugins: ["add-module-exports", ['@babel/plugin-proposal-decorators', {legacy: true}]],
                presets: ['@babel/preset-env', '@babel/preset-react']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build/',
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
                    'res/build/UploaderView.js':'res/build/view/index.js'
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
                    'res/build/UploaderModel.js':'res/build/model/index.js'
                }
            }
        },
        uglify: {
            view: {
                files: {
                    'res/dist/UploaderView.min.js': 'res/build/UploaderView.js',
                    'res/dist/UploaderModel.min.js': 'res/build/UploaderModel.js'
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
                cwd: 'res/dist/',
                src: ['*.min.js'],
                dest: 'res/dist/',
                ext: '.min.js.gz'
            },
        },
        watch: {
            js: {
                files: [
                    "res/js/**/*"
                ],
                tasks: ['babel', 'browserify', 'uglify', 'compress'],
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'compress']);

};
