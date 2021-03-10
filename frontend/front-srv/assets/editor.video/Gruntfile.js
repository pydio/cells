module.exports = function(grunt) {

    const {initConfig, loadNpmTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioVideo')
    config.copy = {
        swf: {
            expand: true,
            src: ['node_modules/video.js/dist/video-js.min.css'],
            dest: './res/dist/',
            flatten:true
        }
    };
    grunt.initConfig(config);

    loadNpmTasks(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'copy', 'compress']);

};
