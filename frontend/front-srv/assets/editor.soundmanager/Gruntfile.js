module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    grunt.initConfig(initConfig('PydioSoundManager'));
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
