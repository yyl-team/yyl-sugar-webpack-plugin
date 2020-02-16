const CHILD_NAME = 'YylSugarWebpackCompiler'
function getChildCompiler (mainCompilation) {
  const outputOptions = {
    filename: '__child-[name]',
    publicPath: mainCompilation.outputOptions.publicPath
  }
  const childCompiler = mainCompilation.createChildCompiler(CHILD_NAME, outputOptions)

  childCompiler.context = mainCompilation.context
  // TODO:
}

module.exports = {
  getChildCompiler
}