const gzipLevel = 9;

module.exports = {
    mins: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/build/',
        src: ['*.min.js'],
        dest: 'res/build/',
        ext: '.min.js.gz'
    },
    boot: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/build/',
        src: ['*.boot.min.js'],
        dest: 'res/build/',
        ext: '.boot.min.js.gz'
    },
    bundle: {
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/build/',
        src: ['*.prod.min.js'],
        dest: 'res/build/',
        ext: '.prod.min.js.gz'
    },
    css:{
        options: {
            mode: 'gzip',
            level:gzipLevel,
        },
        expand: true,
        cwd: 'res/build/',
        src: ['*.material.min.css'],
        dest: 'res/build/',
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