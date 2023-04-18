// Generated using webpack-cli https://github.com/webpack/webpack-cli
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons')

const config = configLoader({
    UploaderView:'./res/js/view/index.js',
    UploaderModel:'./res/js/model/index.js'
}, path.resolve(__dirname, 'res/dist'), CompressionPlugin)

module.exports = () => {
    return config;
};
