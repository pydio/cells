module.exports = function(grunt){

    return {
        styles_material: {
            files: ['res/themes/material/css/**/*.less', 'res/themes/common/css/**/*.less'],
                tasks: ['less', 'cssmin', 'compress:css'],
                options: {
                nospawn: true
            }
        }
    };

}
