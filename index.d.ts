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
  /** 生成的文件名, 默认为 [name]-[hash:8].[ext] */
  filename?: string
}
export =YylSugarWebpackPlugin 