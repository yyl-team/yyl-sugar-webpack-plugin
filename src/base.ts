import path from 'path'
import util from 'yyl-util'
import { createHash } from 'crypto'
import { Compilation, Compiler } from 'webpack'
export function toCtx<T = any>(ctx: any) {
  return ctx as T
}

export interface Alias {
  [index: string]: string | false | string[]
}

export interface ModuleAssets {
  [index: string]: string
}

export interface InitEmitHooksResult {
  assetMap: ModuleAssets
  compilation: Compilation
  alias: Alias
  done: (error?: Error) => void
}

export interface YylWebpackPluginBaseOption {
  context: string
  name: string
}

export type YylWebpackPluginBaseProperty = Required<YylWebpackPluginBaseOption>
export class YylWebpackPluginBase {
  context: YylWebpackPluginBaseProperty['context'] = process.cwd()
  name: YylWebpackPluginBaseProperty['name'] = 'yylBase'
  /** assetsMap */
  assetMap: ModuleAssets = {}

  constructor(option?: YylWebpackPluginBaseOption) {
    if (option?.context) {
      this.context = option.context
    }

    if (option?.name) {
      this.name = option.name
    }
  }

  /** 获取文件类型 */
  getFileType(str: string) {
    const iStr = str.replace(/\?.*/, '')
    const split = iStr.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }

    return ext
  }

  /** 获取文件名称 */
  getFileName(name: string, cnt: Buffer, filename: string) {
    const REG_HASH = /\[hash:(\d+)\]/g
    const REG_NAME = /\[name\]/g
    const REG_EXT = /\[ext\]/g

    const dirname = path.dirname(name)
    const basename = path.basename(name)
    const ext = path.extname(basename).replace(/^\./, '')
    const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0))

    let hash = ''
    if (filename.match(REG_HASH)) {
      let hashLen = 0
      filename.replace(REG_HASH, (str, $1) => {
        hashLen = +$1
        hash = createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen)
        return str
      })
    }
    const r = filename.replace(REG_HASH, hash).replace(REG_NAME, iName).replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }

  /** 初始化 assetMap */
  initEmitHooks(compiler: Compiler): Promise<InitEmitHooksResult> {
    const { output, context, resolve } = compiler.options
    const { name } = this
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
    }

    return new Promise((resolve) => {
      // + map init
      const moduleAssets: ModuleAssets = {}
      compiler.hooks.compilation.tap(name, (compilation) => {
        compilation.hooks.moduleAsset.tap(name, (module: any, file) => {
          if (module.userAssets) {
            moduleAssets[file] = path.join(path.dirname(file), path.basename(module.userRequest))
          }
        })
      })

      compiler.hooks.emit.tapAsync(name, async (compilation, done) => {
        // + init assetMap
        const assetMap: ModuleAssets = {}
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((fName) => {
            if (/hot-update/.test(fName)) {
              return
            }
            if (chunk.name) {
              const key = `${util.path.join(path.dirname(fName), chunk.name)}.${this.getFileType(
                fName
              )}`
              assetMap[key] = fName
            } else {
              assetMap[fName] = fName
            }
          })
        })

        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true
        })
        stats.assets.forEach((asset: any) => {
          const name = moduleAssets[asset.name]
          if (name) {
            assetMap[util.path.join(name)] = asset.name
          }
        })
        // - init assetMap
        resolve({
          assetMap,
          compilation,
          alias,
          done
        })
      })
      // - map init
    })
  }
}