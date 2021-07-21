module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioCKEditor')
    config.copy = {
        ckeditor: {
            expand: true,
            cwd: 'node_modules/ckeditor/',
            src: '**/*',
            dest: './res/dist/ckeditor',
            flatten:false
        }
    };
    grunt.initConfig(config);

    loadNpmTasks(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'copy', 'compress']);

};
