const {initConfig} = require("../gruntConfigCommon");
module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')

    const basicConfig = initConfig('PydioVersioning')
    basicConfig.less = {
        development: {
            options: {
                plugins: [
                    new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions, > 10%"]})
                ]
            },
            files: {
                "res/build/css/revisions.css": "res/css/revisions.less"
            }
        }
    };
    basicConfig.compress.css = {
        expand: true,
        cwd: 'res/build/css',
        src: ['revisions.css'],
        dest: 'res/dist',
        ext: '.css.gz'
    };
    basicConfig.watch.styles = {
        files: ['res/css/*.less'],
        tasks: ['less', 'compress'],
        options: {
            nospawn: true
        }
    };

    grunt.initConfig(basicConfig);
    loadNpmTasks(grunt);
    grunt.loadNpmTasks('assemble-less');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'less', 'compress']);
};
