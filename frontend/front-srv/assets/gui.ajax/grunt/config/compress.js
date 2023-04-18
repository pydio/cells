const gzipLevel = 9;

module.exports = {
    css:{
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/dist/',
        src: ['*.material.min.css'],
        dest: 'res/dist/',
        ext: '.material.min.css.gz'

    }
};