module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('HTTPUploader'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
