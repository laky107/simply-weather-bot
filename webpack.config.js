const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: [ './src/index.ts'],
    watch: false,
    target: 'node',
    externals: [
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
    },
};