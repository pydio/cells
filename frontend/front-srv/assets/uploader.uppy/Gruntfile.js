module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('CaptureUploader')
    grunt.initConfig(config);
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
