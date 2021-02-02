import path from 'path'
import util from 'yyl-util'
import { Compilation, Compiler, WebpackOptionsNormalized } from 'webpack'
import { htmlPathMatch, cssPathMatch, jsPathMatch, REG } from 'yyl-file-replacer'
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

export type YylSugarWebpackPluginOption = Pick<YylWebpackPluginBaseOption, 'context' | 'filename'>

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
  output: Output = {}
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
            notMatchMap[url] = r
            return r
          }
        } else if (output.path) {
          if (assetMap[iPath]) {
            const r = `${util.path.join(output.path, assetMap[iPath])}${qh}`
            renderMap[url] = r
            return r
          } else {
            let r = ''
            if (path.isAbsolute(iPath)) {
              r = `${iPath}${qh}`
            } else {
              if (iUrl.match(SUGAR_REG)) {
                r = `${iPath}${qh}`
              } else {
                r = url
              }
            }
            notMatchMap[url] = r
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

  /** 组件执行函数 */
  async apply(compiler: Compiler) {
    const { output } = compiler.options
    this.output = output

    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME)
    logger.group(PLUGIN_NAME)

    const { compilation, done } = await this.initCompilation(compiler)
    const iHooks = getHooks(compilation)
    logger.info(LANG.SUGAR_INFO)
    let total = 0
    let oriDist = ''

    // 排序
    const keys = Object.keys(compilation.assets)
    const cssKeys = keys.filter((x) => path.extname(x) === '.css')
    const jsKeys = keys.filter((x) => path.extname(x) === '.js')
    const htmlKeys = keys.filter((x) => path.extname(x) === '.html')
    const otherKeys = keys.filter((x) => ['.css', '.js', '.html'].indexOf(path.extname(x)) === -1)
    const sorkKeys = otherKeys.concat(cssKeys).concat(jsKeys).concat(htmlKeys)

    const assetMapKeys = Object.keys(this.assetMap)

    await util.forEach(sorkKeys, async (key) => {
      const srcIndex = assetMapKeys.map((key) => this.assetMap[key]).indexOf(key)
      let fileInfo = {
        src: srcIndex === -1 ? undefined : assetMapKeys[srcIndex],
        source: Buffer.from(compilation.assets[key].source().toString(), 'utf-8'),
        dist: key
      }
      let renderResult: RenderResult = {
        content: Buffer.from(''),
        renderMap: {},
        notMatchMap: {}
      }
      let urlKeys = []
      let warnKeys = []
      switch (path.extname(fileInfo.dist)) {
        case '.css':
        case '.js':
        case '.html':
          fileInfo = await iHooks.beforeSugar.promise(fileInfo)

          renderResult = this.render(fileInfo)

          fileInfo = await iHooks.afterSugar.promise(fileInfo)

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
            logger.warn(`X ${chalk.green(key)} -> ${chalk.red(renderResult.notMatchMap[key])}`)
          })

          total++

          /** 更新 assets */
          this.updateAssets({
            compilation,
            oriDist,
            assetsInfo: fileInfo
          })
          break

        default:
          break
      }
    })

    await iHooks.emit.promise()
    // - init assetMap
    if (total) {
      logger.info(`${LANG.TOTAL}: ${total}`)
    } else {
      logger.info(LANG.NONE)
    }
    logger.groupEnd()
    done()
  }
}

module.exports = YylSugarWebpackPlugin
