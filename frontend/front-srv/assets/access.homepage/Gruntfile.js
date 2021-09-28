module.exports = function(grunt) {

    const {initConfig, loadNpmTasks} = require('../gruntConfigCommon.js')
    const basicConfig = initConfig('WelcomeComponents')
    basicConfig.less = {
        development: {
            options: {
                plugins: [
                    new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions, > 10%"]})
                ]
            },
            files: {
                "res/home.css": "res/home.less"
            }
        }
    };
    basicConfig.compress.css = {
        expand: true,
        cwd: 'res',
        src: ['home.css'],
        dest: 'res',
        ext: '.css.gz'
    };
    basicConfig.watch.styles = {
        files: ['res/*.less'],
        tasks: ['less', 'compress'],
        options: {
            nospawn: true
        }
    };



    grunt.initConfig(basicConfig);

    loadNpmTasks(grunt)
    grunt.loadNpmTasks('assemble-less');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'less', 'compress']);

};
