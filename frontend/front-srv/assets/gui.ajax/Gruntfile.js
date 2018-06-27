/**
 * Main Gruntfile.js is split into smaller files.
 * See grunt/ folder for configs and custom tasks.
 * @param grunt
 */
module.exports = function(grunt) {
    const path = require('path');

    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt/config'),
        jitGrunt: {
            customTasksDir: 'grunt/tasks'
        },
        data: {
            foo: 'bar' // accessible with '<%= foo %>'
        }
    });
};
