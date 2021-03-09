module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioText'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
