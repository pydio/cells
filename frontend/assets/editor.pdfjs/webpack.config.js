// Generated using webpack-cli https://github.com/webpack/webpack-cli
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");
const {configLoader} = require('../webpack-commons')

const config = configLoader({PydioPDFJS:'./res/js/index.js'}, path.resolve(__dirname, 'res/dist'), CompressionPlugin)

// webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');

// FIXME: When building for production, the component is not even called, we 
// need to further debug and fix this.
// For now, build in development mode only.
module.exports = () => {
    return {
        ...config,
        // This is required for react-pdf to work correctly
        // See: https://archive.is/8QRLv#webpack-based-applications-may-require-a-workaround
        devtool: 'source-map',
        plugins: [
            ...config.plugins,
             new CopyWebpackPlugin({
                patterns: [
                    { 
                        from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build'), 
                        to: 'pdfjs/build',
                        filter: async (resourcePath) => 
                            !resourcePath.includes('sandbox') 
                            && !resourcePath.endsWith('.js')
                    },
                ]
            })
        ],

        mode: 'development',
    };
};
