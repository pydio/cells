module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioDiaporama'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
