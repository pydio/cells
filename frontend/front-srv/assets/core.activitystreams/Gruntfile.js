module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioActivityStreams'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
