const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        'pardus-troder': './src/index.js',
        'pardus-troder.min': './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            name: 'PardusTroder',
            type: 'umd',
            export: 'default',
        },
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
          include: /\.min\.js$/
        })],
    },
    resolve: {
        fullySpecified: false,
    },
};
