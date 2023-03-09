// Generated using webpack-cli https://github.com/webpack/webpack-cli
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons')

const config = configLoader({PydioCodeMirror:'./res/js/index.js'}, path.resolve(__dirname, 'res/dist'), CompressionPlugin)
config.output.publicPath = 'plug/editor.codemirror/res/dist/'
config.output.clean = process.env.NODE_ENV==='production'

module.exports = () => {
    return config;
};
