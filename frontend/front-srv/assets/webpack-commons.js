const {Externals} = require('./libdefs.js')
const exts = Externals.reduce((o, k) => {o[k] = k;return o}, {})

module.exports = {
    configLoader: (entries = {}, outputPath, CompressionPlugin) => {
        return ({
            mode: process.env.NODE_ENV === 'production'?'production':'development',
            entry: entries,
            output: {
                path: outputPath,
                filename: '[name].min.js',
                clean: true,
                library: {
                    name: '[name]',
                    type: 'window'
                }
            },
            plugins: [
                // Add your plugins here
                // Learn more about plugins from https://webpack.js.org/configuration/plugins/
                new CompressionPlugin({
                    test: /\.js(\?.*)?$/i,
                }),
            ],
            externalsType: 'commonjs',
            externals: exts,
            module: {
                rules: [
                    {
                        test: /\.(js|jsx)$/i,
                        loader: "babel-loader",
                        options:{
                            plugins: ["@babel/syntax-dynamic-import"],
                            presets: [
                                ["@babel/preset-react"],
                                [
                                    "@babel/preset-env",
                                    {
                                        "modules": false
                                    }
                                ]
                            ]
                        }
                    },
                    {
                        test: /\.less$/i,
                        use: ["style-loader", "css-loader", "less-loader"],
                    },
                    {
                        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                        type: "asset",
                    },

                    // Add your rules for custom modules here
                    // Learn more about loaders from https://webpack.js.org/loaders/
                ],
            },
            watch: true
        })}
}
