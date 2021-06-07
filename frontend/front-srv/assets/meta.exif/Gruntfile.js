module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioExif'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
