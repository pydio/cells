module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('MigrationComponents'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
