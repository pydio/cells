module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('ReactMeta'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
