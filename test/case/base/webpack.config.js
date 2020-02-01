'use strict'
const path = require('path')
const fs = require('fs')
const extFs = require('yyl-fs')
const extOs = require('yyl-os')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')
const YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')
const webpack = require('webpack')

const IPlugin = require('../../../index')

const util = require('yyl-util')

// + setting
const config = {
  proxy: {
    port: 5000,
    homePage: 'http://127.0.0.1:5000/'
  },
  alias: {
    dirname: __dirname,
    root: path.join(__dirname, 'dist'),
    srcRoot: path.join(__dirname, 'src'),

    jsDest: path.join(__dirname, 'dist/assets/js'),
    htmlDest: path.join(__dirname, 'dist/'),
    cssDest: path.join(__dirname, 'dist/assets/css'),
    imagesDest: path.join(__dirname, 'dist/assets/images'),
    sourceDest: path.join(__dirname, 'dist/assets/source')
  },
  dest: {
    basePath: '/'
  },
  concat: {}
}
// - setting

// + plugin options
const iPluginOption = {
  dirs: [],
  data: config.alias
}
// - plugin options

const wConfig = {
  mode: 'development',
  entry: (() => {
    const iSrcRoot = path.isAbsolute(config.alias.srcRoot)
      ? config.alias.srcRoot
      : path.join(__dirname, config.alias.srcRoot)

    let r = {}

    // multi entry
    var entryPath = path.join(iSrcRoot, 'entry')

    if (fs.existsSync(entryPath)) {
      var fileList = extFs.readFilesSync(entryPath, /\.(js|tsx?)$/)
      fileList.forEach((str) => {
        var key = path.basename(str).replace(/\.[^.]+$/, '')
        if (key) {
          r[key] = [str]
        }
      })
    }

    return r
  })(),
  output: {
    path: path.resolve(__dirname, config.alias.jsDest),
    filename: '[name]-[hash:8].js',
    chunkFilename: 'async_component/[name]-[chunkhash:8].js',
    publicPath: util.path.join(
      config.dest.basePath,
      path.relative(
        config.alias.root,
        config.alias.jsDest
      ),
      '/'
    )
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: (file) => (
        /node_modules/.test(file) &&
        !/\.vue\.js/.test(file)
      ),
      use: (() => {
        const loaders = [{
          loader: require.resolve('babel-loader'),
          query: (() => {
            if (!config.babelrc) {
              return {
                babelrc: false,
                cacheDirectory: true
              }
            } else {
              return {}
            }
          })()
        }]

        return loaders
      })()
    }, {
      test: /\.html$/,
      use: [{
        loader: require.resolve('html-loader')
      }]
    }, {
      test: /\.pug$/,
      oneOf: [{
        use: [require.resolve('pug-loader')]
      }]
    }, {
      test: /\.(png|jpg|gif)$/,
      use: {
        loader: require.resolve('url-loader'),
        options: {
          limit: 1,
          name: '[name]-[hash:8].[ext]',
          chunkFilename: 'async_component/[name]-[chunkhash:8].js',
          outputPath: path.relative(
            config.alias.jsDest,
            config.alias.imagesDest
          ),
          publicPath: (function () {
            let r = util.path.join(
              config.dest.basePath,
              path.relative(
                config.alias.root,
                config.alias.imagesDest
              ),
              '/'
            )
            return r
          })()
        }
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: require.resolve('css-loader')
      }]
    }]
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, 'node_modules')
    ]
  },
  resolve: {
    modules: [
      path.join(__dirname, 'node_modules')
    ],
    alias: config.alias
  },
  devtool: 'source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new YylCopyWebpackPlugin([{
      from: path.join(config.alias.srcRoot, 'source'),
      to: config.alias.sourceDest,
      fileName: '[name].[ext]',
      matcher: ['*.html', '!**/.*']
    }, {
      from: path.join(config.alias.srcRoot, 'source'),
      to: config.alias.sourceDest,
      fileName: '[name]-[hash:8].[ext]',
      matcher: ['!*.html', '!**/.*']
    }]),
    new YylConcatWebpackPlugin({
      basePath: __dirname,
      fileMap: {
        'dist/assets/source/js/demo.js': ['src/source/js/a.js', 'src/source/js/b.js']
      }
    }),
    new IPlugin(iPluginOption)
  ],
  optimization: {
    minimizer: [
    ]
  }
}

// + html output
wConfig.plugins = wConfig.plugins.concat((function () { // html 输出
  const entryPath = util.path.join(config.alias.srcRoot, 'entry')
  let outputPath = []
  const r = []

  if (fs.existsSync(entryPath)) {
    outputPath = outputPath.concat(extFs.readFilesSync(entryPath, /(\.jade|\.pug|\.html)$/))
  }

  const outputMap = {}
  const ignoreExtName = function (iPath) {
    return iPath.replace(/(\.jade|.pug|\.html|\.js|\.css|\.ts|\.tsx|\.jsx)$/, '')
  }

  outputPath.forEach((iPath) => {
    outputMap[ignoreExtName(iPath)] = iPath
  })

  const commonChunks = []
  const pageChunkMap = {}
  Object.keys(wConfig.entry).forEach((key) => {
    let iPaths = []
    if (util.type(wConfig.entry[key]) === 'array') {
      iPaths = wConfig.entry[key]
    } else if (util.type(wConfig.entry[key]) === 'string') {
      iPaths.push(wConfig.entry[key])
    }

    let isPageModule = null
    iPaths.some((iPath) => {
      const baseName = ignoreExtName(iPath)
      if (outputMap[baseName]) {
        isPageModule = baseName
        return true
      }
      return false
    })

    if (!isPageModule) {
      commonChunks.push(key)
    } else {
      pageChunkMap[isPageModule] = key
    }
  })

  outputPath.forEach((iPath) => {
    const iBaseName = ignoreExtName(iPath)
    const iChunkName = pageChunkMap[iBaseName]
    const fileName = ignoreExtName(path.basename(iPath))
    let iChunks = []

    iChunks = iChunks.concat(commonChunks)
    if (iChunkName) {
      iChunks.push(iChunkName)
    }

    if (iChunkName) {
      const opts = {
        template: iPath,
        filename: path.relative(config.alias.jsDest, path.join(config.alias.htmlDest, `${fileName}.html`)),
        chunks: iChunks,
        chunksSortMode (a, b) {
          return iChunks.indexOf(a.names[0]) - iChunks.indexOf(b.names[0])
        },
        inlineSource: '.(js|css|ts|tsx|jsx)\\?__inline$',
        minify: false
      }

      r.push(new HtmlWebpackPlugin(opts))
    }
  })

  return r
})())
// - html output

// + dev server
wConfig.devServer = {
  contentBase: config.alias.root,
  compress: true,
  port: config.proxy.port,
  hot: true,
  publicPath: config.dest.basePath,
  writeToDisk: true,
  async after () {
    if (config.proxy.homePage) {
      await extOs.openBrowser(config.proxy.homePage)
    }
  }
}
// - dev server

module.exports = wConfig
