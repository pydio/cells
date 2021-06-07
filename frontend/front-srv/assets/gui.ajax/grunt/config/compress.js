const gzipLevel = 9;

module.exports = {
    mins: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/dist/',
        src: ['*.min.js'],
        dest: 'res/dist/',
        ext: '.min.js.gz'
    },
    boot: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/dist/',
        src: ['*.boot.min.js'],
        dest: 'res/dist/',
        ext: '.boot.min.js.gz'
    },
    bundle: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/dist/',
        src: ['*.prod.min.js'],
        dest: 'res/dist/',
        ext: '.prod.min.js.gz'
    },
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

    },
    docgen:{
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: '.',
        src: ['docgen.json'],
        dest: '',
        ext: '.json.gz'

    }
};