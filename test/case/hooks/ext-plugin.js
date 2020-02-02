/* eslint-disable no-console */
const IPlugin = require('../../../index')
const util = require('yyl-util')

const PLUGIN_NAME = 'check_plugin'
class ExtPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
      IPlugin.getHooks(compilation).beforeSugar.tapAsync(PLUGIN_NAME, async (obj, done) => {
        await util.waitFor(10)
        console.log('hooks.beforeSugar(obj, done)', 'obj:', obj)
        done(null, obj)
      })

      IPlugin.getHooks(compilation).afterSugar.tapAsync(PLUGIN_NAME, async (obj, done) => {
        await util.waitFor(10)
        console.log('hooks.afterSugar(obj, done)', 'obj:', obj)
        done(null, obj)
      })

      IPlugin.getHooks(compilation).emit.tapAsync(PLUGIN_NAME, async (obj, done) => {
        await util.waitFor(10)
        console.log('hooks.emit(obj, done)', 'obj:', obj)
        done(null, obj)
      })
    })
  }
}

module.exports = ExtPlugin
