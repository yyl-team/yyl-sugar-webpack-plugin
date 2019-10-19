declare class IYylSugarWebpackPlugin {
  constructor(op: IYylSugarWebpackPluginOptions)
}
interface IYylSugarWebpackPluginOptions {
  paths: string[],
  matcher?: string[],
  data: {[key: string]: string}
}
export =IYylSugarWebpackPlugin 