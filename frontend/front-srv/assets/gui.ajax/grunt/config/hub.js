module.exports = {
    all: {
        options:{
            concurrent: 80,
            allowSelf:true
        },
        src: ['../*/Gruntfile.js'],
        tasks: ['default']
    }
};