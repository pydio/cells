module.exports = function(grunt) {
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
                tasks: ['babel'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['babel', 'compress']);

};
