module.exports = {
    dndpatch: {
        expand: true,
        src: 'res/js/vendor/dnd-html5-backend-patch/NativeDragSources.js',
        dest: 'node_modules/react-dnd-html5-backend/lib/',
        flatten:true
    }
};