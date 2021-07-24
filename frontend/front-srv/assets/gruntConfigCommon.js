module.exports = {
    initConfig: (libName) => {

        const {Externals} = require('./gui.ajax/res/js/dist/libdefs.js');

        return {
            babel: {
                options: {
                    plugins: ["add-module-exports", ['@babel/plugin-proposal-decorators', {legacy: true}]],
                    presets: ['@babel/preset-env', '@babel/preset-react']
                },
                dist: {
                    files: [
                        {
                            expand: true,
                            cwd: 'res/js/',
                            src: ['**/*.js'],
                            dest: "res/build/" + libName + "/",
                            ext: '.js'
                        }
                    ]
                }
            },
            browserify: {
                lib: {
                    options: {
                        external: Externals,
                        browserifyOptions: {
                            standalone: libName,
                            debug: true
                        }
                    },
                    files: {
                        ['res/build/' + libName + '.js']: 'res/build/' + libName + '/index.js'
                    }
                }
            },
            uglify: {
                lib: {
                    files: {
                        ['res/dist/'+libName+'.min.js']: 'res/build/'+libName+'.js'
                    }
                }
            },
            compress: {
                options: {
                    mode: 'gzip',
                    level: 9,
                },
                js: {
                    expand: true,
                    cwd: 'res/dist/',
                    src: [libName + '.min.js'],
                    dest: 'res/dist/',
                    ext: '.min.js.gz'
                },
            },
            watch: {
                js: {
                    files: [
                        "res/js/**/*"
                    ],
                    tasks: ['babel', 'browserify:lib', 'uglify:lib', 'compress'],
                    options: {
                        spawn: false
                    }
                }
            }
        };
    },
    loadNpmTasks:(grunt) => {
        grunt.loadNpmTasks('grunt-browserify');
        grunt.loadNpmTasks('grunt-babel');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-contrib-compress');
        grunt.loadNpmTasks('grunt-contrib-uglify');
    },
    registerTasks:(grunt) => {
        grunt.registerTask('default', ['babel', 'browserify:lib', 'uglify:lib', 'compress']);;
    }
}