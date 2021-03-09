module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioCodeMirror')
    config.copy = {
        swf: {
            expand: true,
            src: ['node_modules/video.js/dist/video-js.swf', 'node_modules/video.js/dist/video-js.min.css'],
            dest: './res/dist/',
            flatten:true
        }
    };
    grunt.initConfig(config);

    loadNpmTasks(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'copy', 'compress']);

};
