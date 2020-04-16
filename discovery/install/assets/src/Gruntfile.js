module.exports = function(grunt) {

    grunt.initConfig({
        babel: {
            options: {
                presets: ['react', 'env', 'stage-0']
            },

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build/PydioInstall',
                        ext: '.js'
                    }
                ]
            }
        },
        browserify: {
            ui : {
                options: {
                    browserifyOptions:{
                        standalone: 'PydioInstall',
                        debug:true
                    }
                },
                files: {
                    'res/build/PydioInstall.js':'res/build/PydioInstall/index.js'
                }
            }
        },
        json: {
            main: {
                options: {
                    namespace: 'languages',
                    includePath: false,
                    commonjs: true,
                    processName: (filename) => {
                        return filename.split('.').shift();
                    }
                },
                src: ['res/i18n/*.json'],
                dest: 'res/js/gen/languages.js'
            }
        },
        watch: {
            js: {
                files: [
                    "res/js/**/*",
                    "res/i18n/*.json"
                ],
                tasks: ['json', 'babel', 'browserify:ui'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-json');
    grunt.registerTask('default', ['json', 'babel', 'browserify:ui']);
};
