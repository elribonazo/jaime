const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        server: './src/server.js'
    },
    mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
        alias: {
            Api: path.resolve(process.cwd(), 'src/api'),
            Components: path.resolve(process.cwd(), 'src/components'),
            Config: path.resolve(process.cwd(), 'src/config/index.js'),
            Core: path.resolve(process.cwd(), 'src/core'),
            Utils: path.resolve(process.cwd(), 'src/utils'),
            Routes: path.resolve(process.cwd(), 'src/routes')
        },
    },
    output: {
        filename: 'main.js',
        chunkFilename: '[name].js',
        path: path.resolve(process.cwd(), 'dist/server')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}