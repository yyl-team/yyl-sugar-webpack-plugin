/* eslint-disable require-atomic-updates */
const path = require('path')
const util = require('yyl-util')
const { getHooks } = require('./lib/hooks')
const { createHash } = require('crypto')
const { htmlPathMatch, cssPathMatch, jsPathMatch, REG } = require('yyl-file-replacer')
const LANG = require('./lang/index')
const chalk = require('chalk')

const PLUGIN_NAME = 'YylSugar'
// const printError = function(er) {
//   throw new Error(['yyl-sugar-webpack-plugin error:', er])
// }

const SUGAR_REG = /(\{\$)([a-zA-Z0-9@_\-$.~]+)(\})/g
function sugarReplace (str, alias) {
  return str.replace(SUGAR_REG, (str, $1, $2) => {
    if ($2 in alias) {
      return alias[$2]
    } else {
      return str
    }
  })
}

class YylSugarWebpackPlugin {
  constructor({ basePath, filename }) {
    this.basePath = basePath
    this.filename = filename || '[name]-[hash:8].[ext]'
  }
  static getName() {
    return PLUGIN_NAME
  }
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  getFileName(name, cnt) {
    const { filename } = this

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
      })
    }
    const r = filename
      .replace(REG_HASH, hash)
      .replace(REG_NAME, iName)
      .replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }
  render({ dist, source }) {
    const { alias, assetMap, output } = this
    const renderMap = {}
    const notMatchMap = {}
    const replaceHandle = function(url) {
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
          iPath = util.path.relative(
            output.path,
            sugarReplace(iUrl, alias)
          )
        } else {
          iPath = util.path.join(path.dirname(dist), iUrl)
        }

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
  getFileType(str) {
    str = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }
    return ext
  }
  apply(compiler) {
    const { output, context, resolve } = compiler.options
    const { alias } = resolve

    this.alias = {}
    this.output = output

    Object.keys(alias).forEach((key) => {
      let iPath = alias[key]
      if (this.basePath) {
        iPath = path.resolve(this.basePath, iPath)
      }
      iPath = path.resolve(context, iPath)
      this.alias[key] = iPath
    })


    // + map init
    const moduleAssets = {}
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.moduleAsset.tap(PLUGIN_NAME, (module, file) => {
        if (module.userRequest) {
          moduleAssets[file] = path.join(path.dirname(file), path.basename(module.userRequest))
        }
      })
    })
    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      async (compilation, done) => {
        const logger = compilation.getLogger(PLUGIN_NAME)
        logger.group(PLUGIN_NAME)
        // + init assetMap
        const assetMap = {}
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((fName) => {
            // 跳过热更新所生成的文件
            if (/hot-update/.test(fName)) {
              return
            }
            if (chunk.name) {
              const key = `${util.path.join(path.dirname(fName), chunk.name)}.${this.getFileType(fName)}`
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
        stats.assets.forEach((asset) => {
          const name = moduleAssets[asset.name]
          if (name) {
            assetMap[util.path.join(name)] = asset.name
          }
        })
        this.assetMap = assetMap

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

        await util.forEach(sorkKeys, async (key) => {
          const assetMapKeys = Object.keys(this.assetMap)
          let srcIndex = assetMapKeys.map((key) => this.assetMap[key]).indexOf(key)
          let fileInfo = {
            src: srcIndex === -1 ? undefined : assetMapKeys[srcIndex],
            source: compilation.assets[key].source(),
            dist: key
          }
          let renderResult = {}
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

              if (oriDist !== fileInfo.dist) {
                assetMap[fileInfo.src] = fileInfo.dist
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

              compilation.assets[fileInfo.dist] = {
                source() {
                  return fileInfo.source
                },
                size() {
                  return fileInfo.source.length
                }
              }

              // 更新 assetMap
              if (oriDist !== fileInfo.dist) {
                delete compilation.assets[oriDist]
                compilation.hooks.moduleAsset.call({
                  userRequest: fileInfo.src
                }, fileInfo.dist)
              }

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
    )
    // - map init
  }
}

module.exports = YylSugarWebpackPlugin