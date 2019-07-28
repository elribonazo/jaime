const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require("glob");


const getEntryName = (filename) => {
    const matches = /.*\/(.*)\.(?:component|route)\.js/gmi.exec(filename);
    return matches && matches[1] ? matches[1] : null;
}

const entries = {
    main: './src/browser.js',
    ...glob.sync("src/**/*.component.js")
        .reduce((x, y) => Object.assign(x, {
            [getEntryName(y)]: `./src/components/${getEntryName(y)}.component.js`,
        }), {}),
    ...glob.sync("src/**/*.route.js")
        .reduce((x, y) => Object.assign(x, {
            [getEntryName(y)]: `./src/routes/${getEntryName(y)}.route.js`,
        }), {})
};

console.log("entries", entries);

module.exports = {
    entry: entries,
    mode: 'development',
    target: 'web',
    devtool: 'source-map',
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
    node: {
        fs: 'empty'
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name]-chunk.js',
        path: path.resolve(process.cwd(), 'dist/browser')
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
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: false }
                    }
                ]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
                vendor: {
                    // name of the chunk
                    name: 'vendor',
                    // async + async chunks
                    chunks: 'all',
                    // import file path containing node_modules
                    test: /node_modules/,
                    // priority
                    priority: 20
                },
                // common chunk
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'async',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ]
}