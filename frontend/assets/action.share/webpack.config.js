// Generated using webpack-cli https://github.com/webpack/webpack-cli
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons')

const config = configLoader({
    ShareTemplates:'./res/js/templates/index.js',
    ShareActions:'./res/js/actions/index.js',
    ShareDialog:'./res/js/dialog/index.js',
}, path.resolve(__dirname, 'res/dist'), CompressionPlugin)

module.exports = () => {
    return config;
};
