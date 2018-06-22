module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js',
                        src: ['**/*.js'],
                        dest: 'res/build',
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
                        standalone: 'UserAccount',
                        debug: true
                    }
                },
                files: {
                    'res/build/UserAccount.js': 'res/build/index.js'
                }
            }
        },
        watch: {
            js: {
                files: [
                    "res/js/**/*"
                ],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['babel', 'browserify']);

};
