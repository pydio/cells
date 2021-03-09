module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('CompressionActions'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
