module.exports = function(grunt, options){
    grunt.registerTask('compilelib', 'Process lib through babel, browserify and uglify', function(n){
        grunt.task.run('babel:lib');
        grunt.task.run('env:build');
        grunt.task.run('browserify:lib');
        grunt.task.run('env:dev');
        grunt.task.run('uglify:lib');
    });
}