import { AsyncSeriesWaterfallHook } from 'tapable'
interface FileInfo {
  dist: string
  source: Buffer
}

interface Hooks {
  beforeSugar: AsyncSeriesWaterfallHook<FileInfo>
  afterSugar: AsyncSeriesWaterfallHook<FileInfo>
  emit: AsyncSeriesWaterfallHook<undefined>
}

declare class YylSugarWebpackPlugin {
  static getHooks(compilation: any): Hooks
  static getName(): string
  constructor(op: IYylSugarWebpackPluginOption)
}
interface YylSugarWebpackPluginOption {
  basePath?: string
}
export =YylSugarWebpackPlugin 