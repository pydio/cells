module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs.js');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build/PydioLibreOffice/'
                    }
                ]
            }
        },
        browserify: {
            ui : {
                options: {
                    external:Externals,
                    browserifyOptions: {
                        standalone: 'PydioLibreOffice',
                        debug:true
                    }
                },
                files: {
                    'res/build/PydioLibreOffice.js':'res/build/PydioLibreOffice/index.js',
                    'res/build/PydioLibreOfficeActions.js':'res/build/PydioLibreOffice/actions.js'
                }
            }
        },
        watch: {
            js: {
                files: [
                    "res/**/*"
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
