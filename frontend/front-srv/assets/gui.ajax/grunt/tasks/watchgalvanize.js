module.exports = function(grunt, options){

    grunt.registerTask('compilelibsimple', 'Process lib through babel, browserify and uglify', function(n){
        grunt.task.run('babel:lib');
        grunt.task.run(['env:build', 'browserify:lib', 'env:dev']);
        grunt.task.run(['uglify:lib', 'compress:mins']);
    });

    const fs = require('fs');
    const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory());
    dirs('res/js/ui').map((d) => {

        grunt.registerTask('watchgalvanize:' + d, 'Process all libs through babel, browserify and uglify', function(n){
            grunt.option('galvanizeConfig', [
                {configs:{libName:d}}
            ]);
            grunt.task.run('galvanize:compilelibsimple');
        });
    });

}
