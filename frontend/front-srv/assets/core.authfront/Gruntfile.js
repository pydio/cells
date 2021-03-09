module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('AuthfrontCoreActions'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
