declare class IYylSugarWebpackPlugin {
  constructor(op: IYylSugarWebpackPluginOptions)
}
interface IYylSugarWebpackPluginOptions {
  dirs: string[],
  data: {[key: string]: string}
}
export =IYylSugarWebpackPlugin 