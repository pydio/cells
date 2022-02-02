module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

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
        uglify: {
            ui: {
                files: {
                    'res/dist/ShareDialog.min.js': 'res/build/ShareDialog.js',
                    'res/dist/ShareTemplates.min.js': 'res/build/ShareTemplates.js',
                    'res/dist/ShareActions.min.js': 'res/build/model/ShareActions.js'
                }
            }
        },
        less: {
            development: {
                options: {
                    plugins: [
                        new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions, > 10%"]})
                    ]
                },
                files: {
                    "res/react-share-form.css": "res/react-share-form.less",
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
                    "res/js/**/*",
                    "res/*.less"
                ],
                tasks: ['babel', 'browserify', 'uglify', 'less', 'compress'],
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
    grunt.loadNpmTasks('assemble-less');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'less', 'compress']);
};