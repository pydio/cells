module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('FSActions'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
