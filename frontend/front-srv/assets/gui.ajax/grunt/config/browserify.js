module.exports = function(grunt, options){

    const {PydioCoreRequires,LibRequires,Externals} = require('../../res/js/dist/libdefs.js');

    options.libName = grunt.option('libName');
    options.alias = grunt.option('alias');

    return {
        boot: {
            options:{
                browserifyOptions: {
                    debug: true,
                    standalone: 'PydioBootstrap'
                }
            },
            files: {
                'res/build/boot.prod.js': 'res/build/core/PydioBootstrap.js',
            }
        },
        core: {
            options:{
                alias: Object.keys(PydioCoreRequires).map(function(key){
                    return './res/build/core/' + key + ':' + PydioCoreRequires[key];
                }),
                browserifyOptions: {
                    debug: true
                }
            },
            files: {
                'res/build/PydioCore.js': 'res/build/core/index.js',
            }
        },
        dist: {
            options: {
                alias: LibRequires.map(k => k + ':'),
            },
            files: {
                'res/build/bundle.prod.js': 'res/js/dist/export.js'
            }
        },
        lib: {
            options: {
                browserifyOptions: {
                    debug: true,
                    standalone: 'Pydio<%= libName %>'
                },
                external:Externals
            },
            files: {
                './res/build/Pydio<%= libName %>.js':'./res/build/ui/<%= libName %>/index.js'
            }
        }
    };
}

