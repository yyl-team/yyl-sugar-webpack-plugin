const PLUGIN_NAME = 'YylSugar'
const printError = function(er) {
  throw new Error(['yyl-sugar-webpack-plugin error:', er])
}

// + include ohther plugin
let YylCopyWebpackPlugin
try {
  YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')
} catch (er) {
  if (!(er instanceof Error) || er.code !== 'MODULE_NOT_FOUND') {
    printError(er)
  }
}

let YylConcatWebpackPlugin
try {
  YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    printError(e)
  }
}

let HtmlWebpackPlugin
try {
  HtmlWebpackPlugin = require('html-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    printError(e)
  }
}
// - include ohther plugin

class YylSugarWebpackPlugin {
  constructor() {
    // TODO:
  }
  render({src, source}) {
    // TODO:
  }
  apply(compiler) {
    const { output } = compiler.options
    // + concat-plugin
    if (YylConcatWebpackPlugin) {
      compiler.hooks.compilation.tap(YylConcatWebpackPlugin.getName(), (compilation) => {
        YylConcatWebpackPlugin.getHooks(compilation).beforeConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          done(obj)
        })
      })
    }
    // - concat-plugin

    // + copy-plugin
    if (YylCopyWebpackPlugin) {
      compiler.hooks.compilation.tap(YylCopyWebpackPlugin.getName(), (compilation) => {
        YylCopyWebpackPlugin.getHooks(compilation).beforeCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          done(obj)
        })
      })
    }
    // - copy-plugin

    // + html-plugin
    if (HtmlWebpackPlugin) {
      compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (obj, done) => {
          // TODO: 通过 obj.outputName 找回 src 路径
          done(obj)
        })
      })
    }
    // - html-plugin

    // compiler.hooks.emit.tap(
    //   PLUGIN_NAME,
    //   (compilation) => {
        
    //   }
    // )
  }
}

module.exports = YylSugarWebpackPlugin