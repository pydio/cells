module.exports = function(grunt){
    grunt.registerTask('mainjs', [
        'copy:dndpatch',
        'concat:compromise',
        // CORE
        'babel:core',
        'env:build',
        'browserify:boot',
        'browserify:core',
        'browserify:dist',
        'env:dev',
        'uglify:core',
        'uglify:nodejs',
        // Pydio UI
        'compilelibs'
    ]);
};
