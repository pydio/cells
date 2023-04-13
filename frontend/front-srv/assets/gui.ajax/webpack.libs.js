// Generated using webpack-cli https://github.com/webpack/webpack-cli
const path = require("path");
const fs = require('fs');

const CompressionPlugin = require("compression-webpack-plugin");

const {configLoader} = require('../webpack-commons')

const dirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(p+"/"+f).isDirectory());

const entries = dirs('res/js/ui').reduce((obj, folder) => {
    obj['Pydio'+folder] = './res/js/ui/'+folder+'/index.js'
    return obj
}, {})

console.log('Compiling Entries', entries)

const config = configLoader(entries, path.resolve(__dirname, "res/dist/libs"), CompressionPlugin)
config.output.publicPath='plug/gui.ajax/res/dist/libs/'
config.output.clean = process.env.NODE_ENV === 'production'

config.optimization =  {
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules([\\/])(compromise)/,
                name: 'compromise',
                chunks: 'all',
            },
        },
    },
};


module.exports = () => {
    return config;
};
