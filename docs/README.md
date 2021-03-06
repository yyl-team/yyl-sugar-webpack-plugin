yyl-sugar-webpack-plugin / [Exports](modules.md)

# yyl-sugar-webpack-plugin

## USAGE

```javascript
const YylSugarWebpackPlugin = require('yyl-sugar-webpack-plugin')
const wConfig = {
  plugins: [new YylSugarWebpackPlugin({ basePath: __dirname })]
}
```

## hooks

```javascript
let YylSugarWebpackPlugin
try {
  YylSugarWebpackPlugin = require('yyl-sugar-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

const PLUGIN_NAME = 'your_plugin'
class ExtPlugin {
  apply(compiler) {
    const IPlugin = YylSugarWebpackPlugin
    if (IPlugin) {
      compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
        IPlugin.getHooks(compilation).beforeSugar.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.beforeSugar(obj, done)', 'obj:', obj)
          done(null, obj)
        })
        IPlugin.getHooks(compilation).afterSugar.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.afterSugar(obj, done)', 'obj:', obj)
          done(null, obj)
        })

        IPlugin.getHooks(compilation).emit.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.emit(obj, done)', 'obj:', obj)
          done(null, obj)
        })
      })
    }
  }
}
```

## 文档

[这里](./docs/modules.md)
