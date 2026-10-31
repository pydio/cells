const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons');

const config = configLoader(
    {PydioEuroOffice: './res/js/index.js'},
    path.resolve(__dirname, 'res/dist'),
    CompressionPlugin
);

module.exports = () => config;
