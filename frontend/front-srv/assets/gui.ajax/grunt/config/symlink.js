module.exports = {
    options: {
        overwrite: false,
        force: true
    },
    expanded: {
        files : [
            {
                expand: true,
                overwrite: false,
                cwd: 'node_modules/material-ui-legacy/src',
                src: ['less'],
                dest : 'res/themes/common/css/mui/'
            }
        ]
    }
};