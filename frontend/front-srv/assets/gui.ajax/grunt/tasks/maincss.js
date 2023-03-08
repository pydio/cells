module.exports = function(grunt){
    grunt.registerTask('maincss', [
        'less',
        'cssmin',
        'compress:css'
    ]);
};