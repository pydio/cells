module.exports = function(grunt) {

    const {initConfig, loadNpmTasks, registerTasks} = require('../gruntConfigCommon.js')
    const config = initConfig('PydioLibreOffice');
    config.babel.options = {
        plugins : ['transform-react-jsx', 'transform-decorators-legacy'],
        presets : ["es2015"]
    };
    grunt.initConfig(config);
    loadNpmTasks(grunt);
    registerTasks(grunt);

};
