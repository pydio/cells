module.exports = function(grunt, options){

    options.libName = grunt.option('libName');

    return {
        core: {
            options: {
                plugins: ["add-module-exports"],
                presets: ['@babel/preset-env']
            },
            files: [
                {
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
                plugins: ["add-module-exports", ['@babel/plugin-proposal-decorators', {legacy: true}]],
                presets: ['@babel/preset-env', '@babel/preset-react']
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
