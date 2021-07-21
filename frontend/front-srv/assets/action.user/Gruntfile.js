module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const conf = initConfig('UserAccount');
    grunt.initConfig(conf);
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
