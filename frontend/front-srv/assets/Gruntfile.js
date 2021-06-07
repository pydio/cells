module.exports = function(grunt) {

    const fs = require('fs');
    const dirs = fs.readdirSync('./').filter(f => fs.existsSync("./"+f + '/Gruntfile.js'));
    console.log(dirs)

    grunt.initConfig({
        subgrunt: {
            options: {
                // Task-specific options go here.
                npmInstall:false
            },
            all: dirs,
            watch: {
                options:{
                    limit:dirs.length
                },
                projects: dirs.reduce((acc,curr)=> (acc[curr]='watch', acc),{})
            }
        },
    })


    grunt.loadNpmTasks('grunt-subgrunt');
    grunt.registerTask('watch', ['subgrunt:watch']);
    grunt.registerTask('default', ['subgrunt:all']);
}