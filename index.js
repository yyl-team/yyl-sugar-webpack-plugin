const path = require('path')
const util = require('yyl-util')
const { getHooks } = require('./lib/hooks')
const { htmlPathMatch, cssPathMatch, jsPathMatch, REG } = require('yyl-file-replacer')
const LANG = require('./lang/index')

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
  constructor({ basePath }) {
    this.basePath = basePath
  }
  static getName() {
    return PLUGIN_NAME
  }
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  render({ dist, source }) {
    const { alias, assetMap, output } = this
    const renderMap = {}
    const notMatchMap = {}
    const replaceHandle = function(url) {
      if (url.match(REG.IS_HTTP) || url.match(REG.HTML_IS_ABSLUTE) || url.match(REG.HTML_IGNORE_REG)) {
        return url
      } else {
        let iPath = ''
        if (/^\.{1,2}\//.test(url)) {
          iPath = util.path.resolve(path.dirname(dist), url)
        } else {
          iPath = util.path.relative(
            output.path,
            sugarReplace(url, alias)
          )
        }
        if (assetMap[iPath]) {
          const r = util.path.resolve(output.publicPath, assetMap[iPath])
          renderMap[url] = r
          return r
        } else {
          const r = util.path.resolve(output.publicPath, iPath)
          notMatchMap[url] = iPath
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
        await util.forEach(Object.keys(compilation.assets), async (key) => {
          let fileInfo = {
            source: compilation.assets[key].source(),
            dist: key
          }
          let renderResult = {}
          let urlKeys = []
          let errKeys = []
          switch (path.extname(fileInfo.dist)) {
            case '.css':
            case '.js':
            case '.html':
              fileInfo = await iHooks.beforeSugar.promise(fileInfo)

              renderResult = this.render(fileInfo)


              // 没任何匹配则跳过
              urlKeys = Object.keys(renderResult.renderMap)
              errKeys = Object.keys(renderResult.notMatchMap)
              if (!urlKeys.length && !errKeys.length) {
                return
              }

              fileInfo.source = renderResult.content
              logger.info(`# ${LANG.SUGAR_REPLACE} ${key}:`)
              urlKeys.forEach((key) => {
                logger.info(`- ${key} -> ${renderResult.renderMap[key]}`)
              })

              errKeys.forEach((key) => {
                logger.error(`- ${key} x> ${renderResult.notMatchMap[key]}`)
              })

              fileInfo = await iHooks.afterSugar.promise(fileInfo)
              total++

              compilation.assets[key] = {
                source() {
                  return fileInfo.source
                },
                size() {
                  return fileInfo.source.length
                }
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