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

## ts

```typescript
/// <reference types="node" />
import { Compilation, Compiler, WebpackOptionsNormalized } from 'webpack'
import {
  YylWebpackPluginBase,
  YylWebpackPluginBaseOption,
  ModuleAssets
} from 'yyl-webpack-plugin-base'
declare type Output = WebpackOptionsNormalized['output']
export declare type YylSugarWebpackPluginOption = Pick<
  YylWebpackPluginBaseOption,
  'context' | 'filename'
>
export declare type YylSugarWebpackPluginProperty = Required<YylSugarWebpackPluginOption>
export interface RenderOption {
  dist: string
  source: Buffer
}
export interface RenderResult {
  content: Buffer
  renderMap: ModuleAssets
  notMatchMap: ModuleAssets
}
export interface InitEmitHooksResult {
  assetMap: ModuleAssets
  compilation: Compilation
  done: (error?: Error) => void
}
export default class YylSugarWebpackPlugin extends YylWebpackPluginBase {
  output: Output
  /** hooks 用方法: 获取 hooks */
  static getHooks(compilation: Compilation): any
  /** hooks 用方法: 获取插件名称 */
  static getName(): string
  constructor(option?: YylSugarWebpackPluginOption)
  render(op: RenderOption): RenderResult
  /** 组件执行函数 */
  apply(compiler: Compiler): Promise<void>
}
export {}
```
