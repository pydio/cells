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
        uglify: {
            lib: {
                files: {
                    'res/dist/PydioBrowserEditor.min.js': 'res/build/PydioBrowserEditor.js',
                    'res/dist/PydioBrowserActions.min.js': 'res/build/PydioBrowserActions.js'
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
                    "res/**/*"
                ],
                tasks: ['babel', 'browserify:ui', 'uglify', 'compress'],
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['babel', 'browserify:ui', 'uglify', 'compress']);

};
