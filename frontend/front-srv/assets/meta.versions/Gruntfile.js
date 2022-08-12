const {initConfig} = require("../gruntConfigCommon");
module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioVersioning'));
    loadNpmTasks(grunt);
    registerTasks(grunt);
};
