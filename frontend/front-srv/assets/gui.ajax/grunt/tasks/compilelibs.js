module.exports = function(grunt, options){

    grunt.registerTask('compilelib', 'Process lib through babel, browserify and uglify', function(n){
        grunt.task.run('babel:lib');
        grunt.task.run(['env:build', 'browserify:lib', 'env:dev']);
        grunt.task.run('uglify:lib');
    });

    grunt.registerTask('compilelibs', 'Process all libs through babel, browserify and uglify', function(n){

        const fs = require('fs');
        const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory());

        grunt.option('galvanizeConfig',
            dirs('res/js/ui').map((d) => {
                return {configs:{libName:d}}
            })
        );
        grunt.task.run('galvanize:compilelib');
    });
}