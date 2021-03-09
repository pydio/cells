module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioPDFJS'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
