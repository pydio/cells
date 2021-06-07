module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioMaps'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
