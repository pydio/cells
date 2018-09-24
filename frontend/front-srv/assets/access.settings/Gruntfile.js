module.exports = function(grunt) {

    const {Externals} = require('../gui.ajax/res/js/dist/libdefs');

    grunt.initConfig({
        babel: {
            options: {},

            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'res/js/',
                        src: ['**/*.js'],
                        dest: 'res/build/',
                        ext: '.js'
                    }
                ]
            },
            components: {files: [{expand: true,cwd: 'res/js/AdminComponents/',src: ['**/*.js'],dest: 'res/build/AdminComponents/',ext: '.js'}]},
            workspaces: {files: [{expand: true,cwd: 'res/js/AdminWorkspaces/',src: ['**/*.js'],dest: 'res/build/AdminWorkspaces/',ext: '.js'}]},
            people: {files: [{expand: true,cwd: 'res/js/AdminPeople/',src: ['**/*.js'],dest: 'res/build/AdminPeople/',ext: '.js'}]},
            plugins: {files: [{expand: true,cwd: 'res/js/AdminPlugins/',src: ['**/*.js'],dest: 'res/build/AdminPlugins/',ext: '.js'}]},
            scheduler: {files: [{expand: true,cwd: 'res/js/AdminScheduler/',src: ['**/*.js'],dest: 'res/build/AdminScheduler/',ext: '.js'}]},
            logs: {files: [{expand: true,cwd: 'res/js/AdminLogs/',src: ['**/*.js'],dest: 'res/build/AdminLogs/',ext: '.js'}]},
            services: {files: [{expand: true,cwd: 'res/js/AdminServices/',src: ['**/*.js'],dest: 'res/build/AdminServices/',ext: '.js'}]}
        },
        browserify: {
            ui : {
                options: {
                    external:Externals
                },
                files: {
                    'res/build/AdminComponents.js'  : 'res/build/AdminComponents/index.js',
                    'res/build/AdminWorkspaces.js'  : 'res/build/AdminWorkspaces/index.js',
                    'res/build/AdminPeople.js'      : 'res/build/AdminPeople/index.js',
                    'res/build/AdminLogs.js'        : 'res/build/AdminLogs/index.js',
                    'res/build/AdminPlugins.js'     : 'res/build/AdminPlugins/index.js',
                    'res/build/AdminScheduler.js'   : 'res/build/AdminScheduler/index.js',
                    'res/build/AdminServices.js'    : 'res/build/AdminServices/index.js',
                }
            },
            components : {
                options: { external:Externals },
                files: { 'res/build/AdminComponents.js'  : 'res/build/AdminComponents/index.js' }
            },
            workspaces : {
                options: { external:Externals },
                files: { 'res/build/AdminWorkspaces.js'  : 'res/build/AdminWorkspaces/index.js' }
            },
            people : {
                options: { external:Externals },
                files: { 'res/build/AdminPeople.js'  : 'res/build/AdminPeople/index.js' }
            },
            plugins : {
                options: { external:Externals },
                files: { 'res/build/AdminPlugins.js'  : 'res/build/AdminPlugins/index.js' }
            },
            scheduler : {
                options: { external:Externals },
                files: { 'res/build/AdminScheduler.js'  : 'res/build/AdminScheduler/index.js' }
            },
            logs : {
                options: { external:Externals },
                files: { 'res/build/AdminLogs.js'  : 'res/build/AdminLogs/index.js' }
            },
            services : {
                options: { external:Externals },
                files: { 'res/build/AdminServices.js'  : 'res/build/AdminServices/index.js' }
            }
        },
        compress: {
            options: {
                mode: 'gzip',
                level:9,
            },
            all: {
                expand: true,
                cwd: 'res/build/',
                src: ['*.js'],
                dest: 'res/build/',
                ext: '.js.gz'
            },
        },
        less: {
            development: {
                options: {
                    plugins: [
                        new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions, > 10%"]})
                    ]
                },
                files: {
                    "res/css/rolesEditor.css": "res/css/rolesEditor.less",
                    "res/css/ajxp_admin.css": "res/css/ajxp_admin.less",
                    "res/css/codemirror.css": "res/css/codemirror.less",
                    "res/css/codemirror-hints.css": "res/css/codemirror-hints.less",
                    "res/css/swagger-custom.css": "res/css/swagger-custom.less"
                }
            }
        },
        watch: {
            comps: {
                files: [
                    "res/js/AdminComponents/**/*"
                ],
                tasks: ['babel:components', 'browserify:components', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            ws: {
                files: [
                    "res/js/AdminWorkspaces/**/*"
                ],
                tasks: ['babel:workspaces', 'browserify:workspaces', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            people: {
                files: [
                    "res/js/AdminPeople/**/*"
                ],
                tasks: ['babel:people', 'browserify:people', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            plugins: {
                files: [
                    "res/js/AdminPlugins/**/*"
                ],
                tasks: ['babel:plugins', 'browserify:plugins', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            sched: {
                files: [
                    "res/js/AdminScheduler/**/*"
                ],
                tasks: ['babel:scheduler', 'browserify:scheduler', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            logs: {
                files: [
                    "res/js/AdminLogs/**/*"
                ],
                tasks: ['babel:logs', 'browserify:logs', 'compress:all'],
                options: {
                    spawn: false
                }
            },
            services: {
                files: [
                    "res/js/AdminServices/**/*"
                ],
                tasks: ['babel:services', 'browserify:services', 'compress:all'],
                options: {
                    spawn: false
                }
            },
        }
    });
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('assemble-less');
    grunt.registerTask('default', ['babel:dist', 'browserify:ui', 'less', 'compress:all']);
    grunt.registerTask('type:js', ['babel:dist', 'browserify:ui', 'compress:all']);
    grunt.registerTask('type:css', ['less']);

};