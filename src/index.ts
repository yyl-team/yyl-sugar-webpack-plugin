import path from 'path'
import util from 'yyl-util'
import { Compilation, Compiler, WebpackOptionsNormalized } from 'webpack'
import { htmlPathMatch, cssPathMatch, jsPathMatch, REG } from 'yyl-file-replacer'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { getHooks } from './hooks'
import { LANG } from './lang'
import chalk from 'chalk'
import {
  YylWebpackPluginBase,
  YylWebpackPluginBaseOption,
  Alias,
  ModuleAssets,
  toCtx
} from 'yyl-webpack-plugin-base'

const PLUGIN_NAME = 'YylSugar'

const SUGAR_REG = /(\{\$)([a-zA-Z0-9@_\-$.~]+)(\})/g

type Output = WebpackOptionsNormalized['output']

export type YylSugarWebpackPluginOption = Pick<
  YylWebpackPluginBaseOption,
  'context' | 'filename'
> & {
  HtmlWebpackPlugin?: typeof HtmlWebpackPlugin
}

export type YylSugarWebpackPluginProperty = Required<YylSugarWebpackPluginOption>

export interface RenderOption {
  dist: string
  source: Buffer
}

export interface RenderResult {
  content: Buffer
  renderMap: ModuleAssets
  notMatchMap: ModuleAssets
}

/** sugar 文件信息 */
export interface SugarOption {
  fileInfo: {
    /** 文件原地址 */
    src?: string
    /** 文件输出地址 */
    dist: string
    /** 文件内容 */
    source: Buffer
  }
  compilation: Compilation
  hooks: any
}

function sugarReplace(str: string, alias: Alias) {
  return str.replace(SUGAR_REG, (str, $1, $2: any) => {
    if (typeof alias === 'object') {
      if ($2 in alias) {
        return toCtx<any>(alias)[$2]
      } else {
        return str
      }
    } else {
      return str
    }
  })
}

export interface InitEmitHooksResult {
  assetMap: ModuleAssets
  compilation: Compilation
  done: (error?: Error) => void
}

export default class YylSugarWebpackPlugin extends YylWebpackPluginBase {
  alias: Alias = {}
  output: Output = {}
  HtmlWebpackPlugin?: typeof HtmlWebpackPlugin
  /** hooks 用方法: 获取 hooks */
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  /** hooks 用方法: 获取插件名称 */
  static getName() {
    return PLUGIN_NAME
  }

  constructor(option?: YylSugarWebpackPluginOption) {
    super({
      ...option,
      name: PLUGIN_NAME
    })
    if (option?.HtmlWebpackPlugin) {
      this.HtmlWebpackPlugin = option.HtmlWebpackPlugin
    }
  }

  render(op: RenderOption): RenderResult {
    const { dist, source } = op
    const { alias, assetMap, output } = this
    const renderMap: ModuleAssets = {}
    const notMatchMap: ModuleAssets = {}
    const replaceHandle = (url: string) => {
      if (
        url.match(REG.IS_HTTP) ||
        url.match(REG.HTML_IS_ABSLUTE) ||
        url.match(REG.HTML_IGNORE_REG)
      ) {
        return url
      } else {
        let iUrl = url
        let qh = ''
        const QUERY_HASH_REG = /(^.+)([?#].*)$/
        if (iUrl.match(QUERY_HASH_REG)) {
          qh = iUrl.replace(QUERY_HASH_REG, '$2')
          iUrl = iUrl.replace(QUERY_HASH_REG, '$1')
        }

        let iPath = ''
        if (iUrl.match(SUGAR_REG)) {
          iPath = util.path.relative(output?.path || '', sugarReplace(iUrl, alias))
        } else {
          iPath = util.path.join(path.dirname(dist), iUrl)
        }

        if (typeof output?.publicPath === 'string' && output.publicPath !== 'auto') {
          if (assetMap[iPath]) {
            const r = `${util.path.join(output.publicPath, assetMap[iPath])}${qh}`
            renderMap[url] = r
            return r
          } else {
            let r = ''
            if (path.isAbsolute(iPath)) {
              r = `${iPath}${qh}`
            } else {
              if (iUrl.match(SUGAR_REG)) {
                r = `${util.path.join(output.publicPath, iPath)}${qh}`
              } else {
                r = url
              }
            }
            if (url !== r) {
              notMatchMap[url] = r
            }
            return r
          }
        } else if (output.path) {
          const relativeBase = util.path.relative(
            path.join(output.path, path.dirname(dist)),
            output.path
          )

          if (assetMap[iPath]) {
            const r = `${util.path.join(relativeBase, assetMap[iPath])}${qh}`
            renderMap[url] = r
            return r
          } else {
            let r = ''
            if (path.isAbsolute(iPath)) {
              r = `${iPath}${qh}`
            } else {
              if (iUrl.match(SUGAR_REG)) {
                r = `${util.path.join(relativeBase, iPath)}${qh}`
              } else {
                r = url
              }
            }
            if (r !== url) {
              notMatchMap[url] = r
            }
            return r
          }
        } else {
          return url
        }
      }
    }

    const iExt = path.extname(dist)
    let r = source.toString()
    switch (iExt) {
      case '.js':
        r = jsPathMatch(r, replaceHandle)
        break

      case '.css':
        r = cssPathMatch(r, replaceHandle)
        break

      case '.html':
        r = htmlPathMatch(r, replaceHandle)
        break

      default:
        break
    }
    return {
      content: Buffer.from(r),
      renderMap,
      notMatchMap
    }
  }

  async sugarFile(op: SugarOption): Promise<SugarOption['fileInfo'] | undefined> {
    let { compilation, fileInfo, hooks } = op
    const logger = compilation.getLogger(PLUGIN_NAME)

    let renderResult: RenderResult = {
      content: Buffer.from(''),
      renderMap: {},
      notMatchMap: {}
    }
    let oriDist = ''
    let urlKeys = []
    let warnKeys = []
    switch (path.extname(fileInfo.dist)) {
      case '.css':
      case '.js':
      case '.html':
        fileInfo = await hooks.beforeSugar.promise(fileInfo)

        renderResult = this.render(fileInfo)

        fileInfo = await hooks.afterSugar.promise(fileInfo)

        // 没任何匹配则跳过
        urlKeys = Object.keys(renderResult.renderMap)
        warnKeys = Object.keys(renderResult.notMatchMap)
        if (!urlKeys.length && !warnKeys.length) {
          return
        }

        fileInfo.source = renderResult.content
        oriDist = fileInfo.dist
        if (path.extname(oriDist) !== '.html' && fileInfo.src) {
          fileInfo.dist = this.getFileName(fileInfo.src, renderResult.content)
        }

        if (oriDist !== fileInfo.dist && fileInfo.src) {
          toCtx<any>(this.assetMap)[fileInfo.src] = fileInfo.dist
          logger.info(chalk.yellow(`# ${LANG.SUGAR_REPLACE} ${oriDist} -> ${fileInfo.dist}:`))
        } else {
          logger.info(chalk.yellow(`# ${LANG.SUGAR_REPLACE} ${fileInfo.dist}:`))
        }
        urlKeys.forEach((key) => {
          logger.info(`Y ${chalk.green(key)} -> ${chalk.cyan(renderResult.renderMap[key])}`)
        })

        warnKeys.forEach((key) => {
          logger.warn(`! ${chalk.green(key)} -> ${chalk.red(renderResult.notMatchMap[key])}`)
        })

        return fileInfo

      default:
        break
    }
  }

  /** 组件执行函数 */
  async apply(compiler: Compiler) {
    const { output, context, resolve } = compiler.options
    this.output = output

    let total = 0

    // alias path resolve
    const alias: Alias = {}
    if (resolve.alias) {
      Object.keys(resolve.alias).forEach((key) => {
        let iPath: string = toCtx<any>(resolve.alias)[key]
        if (iPath) {
          iPath = path.resolve(this.context, iPath)
        }
        if (context) {
          iPath = path.resolve(context, iPath)
        }

        alias[key] = iPath
      })
      this.alias = alias
    }

    // html-webpack-plugin
    const { HtmlWebpackPlugin } = this
    if (HtmlWebpackPlugin) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          PLUGIN_NAME,
          async (info, cb) => {
            const fileInfo = await this.sugarFile({
              compilation,
              hooks: getHooks(compilation),
              fileInfo: {
                src: info.plugin.options?.template || undefined,
                dist: info.outputName,
                source: Buffer.from(info.html)
              }
            })
            if (fileInfo) {
              info.html = fileInfo.source.toString()
              total++
            }
            cb(null, info)
          }
        )
      })
    }

    // assets
    this.initCompilation({
      compiler,
      onProcessAssets: async (compilation) => {
        total = 0
        const logger = compilation.getLogger(PLUGIN_NAME)
        logger.group(PLUGIN_NAME)
        const iHooks = getHooks(compilation)
        logger.info(LANG.SUGAR_INFO)

        // 排序
        const keys = Object.keys(compilation.assets)
        const cssKeys = keys.filter((x) => path.extname(x) === '.css')
        const jsKeys = keys.filter((x) => path.extname(x) === '.js')
        const htmlKeys = keys.filter((x) => path.extname(x) === '.html')
        const otherKeys = keys.filter(
          (x) => ['.css', '.js', '.html'].indexOf(path.extname(x)) === -1
        )
        const sortedKeys = otherKeys.concat(cssKeys).concat(jsKeys).concat(htmlKeys)

        const assetMapKeys = Object.keys(this.assetMap)

        // assets sugar replace
        await util.forEach(sortedKeys, async (key) => {
          const srcIndex = assetMapKeys.map((key) => this.assetMap[key]).indexOf(key)
          const fileInfo = await this.sugarFile({
            fileInfo: {
              src: srcIndex === -1 ? undefined : assetMapKeys[srcIndex],
              source: Buffer.from(compilation.assets[key].source().toString(), 'utf-8'),
              dist: key
            },
            compilation,
            hooks: iHooks
          })

          if (fileInfo) {
            this.updateAssets({
              compilation,
              oriDist: key,
              assetsInfo: fileInfo
            })
            total++
          }
        })

        // - init assetMap

        // total count
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, cb) => {
          await iHooks.emit.promise()
          if (total) {
            logger.info(`${LANG.TOTAL}: ${total}`)
          } else {
            logger.info(LANG.NONE)
          }
          logger.groupEnd()
          cb()
        })
      }
    })
  }
}

module.exports = YylSugarWebpackPlugin
