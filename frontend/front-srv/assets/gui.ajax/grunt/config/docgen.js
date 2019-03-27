module.exports = {
    plugins: {
        files:[
            {
                mode: {loose: true},
                expand: true,
                cwd: '.',
                src: ['../*/react/**/*.{es6,js}', '../*/res/js/**/*.{es6,js}', '../*/res/react/**/*.{es6,js}'],
                dest:'./docgen.json'
            }
        ],
        guiajax:[
            {
                mode: {loose: true},
                expand: true,
                cwd: '.',
                src: ['res/js/**/*.{es6,js}'],
                dest:'./docgen.json'
            }
        ]
    }
}