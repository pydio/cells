module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const conf = initConfig('UserAccount');
    conf.babel.options.optional = ['es7.classProperties'];
    grunt.initConfig(conf);
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
