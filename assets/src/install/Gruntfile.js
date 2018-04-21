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
        watch: {
            js: {
                files: [
                    "res/js/**/*"
                ],
                tasks: ['babel', 'browserify:ui'],
                options: {
                    spawn: false
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['babel', 'browserify:ui']);
};
