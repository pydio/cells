// Generated using webpack-cli https://github.com/webpack/webpack-cli
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const {configLoader} = require('../webpack-commons')

const entries = {
    'AdminComponents'  : './res/js/AdminComponents/index.js',
    'AdminWorkspaces'  : './res/js/AdminWorkspaces/index.js',
    'AdminPeople'      : './res/js/AdminPeople/index.js',
    'AdminLogs'        : './res/js/AdminLogs/index.js',
    'AdminPlugins'     : './res/js/AdminPlugins/index.js',
    'AdminScheduler'   : './res/js/AdminScheduler/index.js',
    'AdminServices'    : './res/js/AdminServices/index.js',
}

const config = configLoader(entries, path.resolve(__dirname, "res/dist"), CompressionPlugin)
config.output.publicPath='plug/access.settings/res/dist/'
//config.output.clean = true
config.optimization =  {
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules([\\/])(codemirror)[\\/]/,
                    name: 'codemirror',
                    chunks: 'all',
            },
        },
    },
};

module.exports = () => {
    return config;
};
