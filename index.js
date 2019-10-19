const PLUGIN_NAME = 'YylSugar'
// const printError = function(msg) {
//   throw `__inline('name') error: ${msg}`
// }

class YylSugarWebpackPlugin {
  constructor() {
    // TODO:
  }
  apply(compiler) {
    const { output } = compiler.options
    compiler.hooks.emit.tap(
      PLUGIN_NAME,
      (compilation) => {
      }
    )
  }
}

module.exports = YylSugarWebpackPlugin