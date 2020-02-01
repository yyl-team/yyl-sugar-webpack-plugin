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
    return source
  }
  apply(compiler) {
    const { output } = compiler.options
    // + concat-plugin
    if (YylConcatWebpackPlugin) {
      console.log('=== have YylConcatWebpackPlugin')
      compiler.hooks.compilation.tap(YylConcatWebpackPlugin.getName(), (compilation) => {
        YylConcatWebpackPlugin.getHooks(compilation).beforeConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('=== concat plugin', obj.src, obj.source)
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          console.log('=== concat done', obj.source)
          done(obj)
        })
      })
    }
    // - concat-plugin

    // + copy-plugin
    if (YylCopyWebpackPlugin) {
      console.log('=== have YylCopyWebpackPlugin')
      compiler.hooks.compilation.tap(YylCopyWebpackPlugin.getName(), (compilation) => {
        YylCopyWebpackPlugin.getHooks(compilation).beforeCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('=== copy plugin', obj.src, obj.source)
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          console.log('=== copy done', obj.source)
          done(obj)
        })
      })
    }
    // - copy-plugin

    // + html-plugin
    // if (HtmlWebpackPlugin) {
    //   console.log('=== have HtmlWebpackPlugin')
    //   compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', (compilation) => {
    //     HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (obj, done) => {
    //       console.log('=== obj.outputName', obj.outputName)
    //       // TODO: 通过 obj.outputName 找回 src 路径
    //       done(obj)
    //     })
    //   })
    // }
    // - html-plugin

    // compiler.hooks.emit.tap(
    //   PLUGIN_NAME,
    //   (compilation) => {
        
    //   }
    // )
  }
}

module.exports = YylSugarWebpackPlugin