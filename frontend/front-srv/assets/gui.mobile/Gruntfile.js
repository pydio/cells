module.exports = function(grunt) {

    const {initConfig, loadNpmTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('MobileExtensions')
    config.copy = {
        smartbannercss: {
            expand: true,
            src: 'node_modules/smart-app-banner/dist/smart-app-banner.css',
            dest: 'res/',
            flatten: true
        },
    };
    grunt.initConfig(config);

    loadNpmTasks(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['babel', 'browserify', 'uglify', 'copy', 'compress']);

};
