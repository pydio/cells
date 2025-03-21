// Generated using webpack-cli https://github.com/webpack/webpack-cli
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons')

const config = configLoader({BlockNote:'./res/js/index.js'}, path.resolve(__dirname, 'res/dist'), CompressionPlugin)
config.output.publicPath = 'plug/editor.bnote/res/dist/'

module.exports = () => {
    return config;
};
