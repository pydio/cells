module.exports = function(grunt){
    grunt.registerTask('maincss', [
        'symlink',
        'less',
        'cssmin'
    ]);
};