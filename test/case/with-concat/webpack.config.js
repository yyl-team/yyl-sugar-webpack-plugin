'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')
const extOs = require('yyl-os')
const IPlugin = require('../../../')

console.log(IPlugin)

// + plugin options
const iPluginOption = {
  context: __dirname,
  HtmlWebpackPlugin: HtmlWebpackPlugin
}
// - plugin options

const wConfig = {
  mode: 'development',
  context: __dirname,
  entry: {
    main: ['./src/entry/index/index.js']
  },
  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'js/[name]-[chunkhash:8].js',
    chunkFilename: 'js/async_component/[name]-[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      jsDest: './dist/js'
    }
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new YylConcatWebpackPlugin({
      fileMap: {
        './dist/js/ab.js': ['./src/js/a.js', './src/js/b.js']
      },
      minify: true,
      logContext: __dirname,
      context: __dirname
    }),
    new HtmlWebpackPlugin({
      template: './src/entry/index/index.html',
      filename: 'html/index.html',
      chunks: 'all'
    }),
    new HtmlWebpackPlugin({
      template: './src/entry/index/index.html',
      filename: 'html/sub.html',
      chunks: 'all'
    }),
    new IPlugin(iPluginOption)
  ],
  devServer: {
    contentBase: './dist',
    compress: true,
    port: 5000,
    openPage: 'http://127.0.0.1:5000/html/'
  }
}

module.exports = wConfig
