# yyl-sugar-webpack-plugin

## USAGE
```javascript
const YylSugarWebpackPlugin = require('yyl-sugar-webpack-plugin')
const wConfig = {
  plugins: [
    new YylSugarWebpackPlugin({ basePath: __dirname })
  ]
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
  apply (compiler) {
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

## ts
```typescript
import { AsyncSeriesWaterfallHook } from 'tapable'
interface FileInfo {
  /** 目标路径 */
  dist: string
  /** 内容 */
  source: Buffer
}

interface Hooks {
  /** 执行插件前 */
  beforeSugar: AsyncSeriesWaterfallHook<FileInfo>
  /** 执行插件后 */
  afterSugar: AsyncSeriesWaterfallHook<FileInfo>
  /** 完成时 */
  emit: AsyncSeriesWaterfallHook<undefined>
}

declare class YylSugarWebpackPlugin {
  /** 获取钩子 */
  static getHooks(compilation: any): Hooks
  /** 获取组件名称 */
  static getName(): string
  constructor(op: YylSugarWebpackPluginOption)
}
interface YylSugarWebpackPluginOption {
  /** 基础路径, 如设置会 resolve webpack 中的 alias */
  basePath?: string
}
export =YylSugarWebpackPlugin 
```
