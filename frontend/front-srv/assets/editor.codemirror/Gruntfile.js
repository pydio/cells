module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioCodeMirror')
    config.copy = {
        ckeditor: {
            expand: true,
            cwd: 'node_modules/codemirror/',
            src: '**/*',
            dest: './res/dist/codemirror',
            flatten:false
        }
    };
    grunt.initConfig(config);

    loadNpmTasks(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'copy', 'compress']);


};
