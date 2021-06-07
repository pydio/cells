module.exports = function(grunt, options){

    options.libName = grunt.option('libName');

    return {
        options: {
            mangle: false,
            compress: {
                hoist_funs: false
            }
        },
        core: {
            files: {
                'res/dist/pydio.min.js': [
                    'res/js/vendor/modernizr/modernizr.min.js',
                    'res/build/PydioCore.js'
                ],
                'res/dist/pydio.boot.min.js': [
                    'res/js/vendor/es6/browser-polyfill.js',
                    'res/build/boot.prod.js'
                ]
            }
        },
        nodejs: {
            files: {
                'res/dist/bundle.prod.min.js': ['res/build/bundle.prod.js']
            }
        },
        lib:{
            files: {
                'res/dist/Pydio<%= libName%>.min.js':'res/build/Pydio<%= libName%>.js',
            }
        }
    };
};