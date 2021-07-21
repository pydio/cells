module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioLibreOffice');
    grunt.initConfig(config);
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
