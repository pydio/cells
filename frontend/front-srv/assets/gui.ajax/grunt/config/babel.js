module.exports = function(grunt, options){

    options.libName = grunt.option('libName');

    return {
        options: {
            loose: 'all'
        },
        core: {
            options: {
                optional: ['es7.classProperties'],
            },
            files: [
                {
                    mode: {loose: true},
                    expand: true,
                    cwd: 'res/js/core/',
                    src: ['**/*.{es6,js}'],
                    dest: 'res/build/core/',
                    ext: '.js'
                }
            ]
        },
        lib:{
            options: {
                optional: ['es7.decorators', 'es7.classProperties'],
            },
            files: [
                {
                    expand: true,
                    cwd: 'res/js/ui/<%= libName %>/',
                    src: ['**/*.js'],
                    dest: 'res/build/ui/<%= libName %>/',
                    ext: '.js'
                }
            ]
        }
    };

}
