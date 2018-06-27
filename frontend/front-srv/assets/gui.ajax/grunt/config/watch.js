module.exports = function(grunt){

    const {PydioCoreRequires} = require('../../res/js/dist/libdefs.js');

    let config = {
        core : {
            files:[
                'res/js/core/*.es6',
                'res/js/core/**/*.es6'
            ],
                tasks:['babel:core', 'browserify:core'],
                options:{
                spawn:false
            }
        },
        styles_material: {
            files: ['res/themes/material/css/**/*.less', 'res/themes/common/css/**/*.less'],
                tasks: ['less', 'cssmin'],
                options: {
                nospawn: true
            }
        },
        manifests: {
            files: ['../*/manifest.xml'],
                tasks: ['clean:cache']
        }
    };

    // Watch Each LIB
    const fs = require('fs');
    const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory());
    dirs('res/js/ui').map((d) => {
        config[d] = {
            files: [
                'res/js/ui/'+d+'/**/*.js'
            ],
            tasks:['watchgalvanize:' + d],
            options: {
                spawn: false,
            }
        }
    });

    return config;

}

