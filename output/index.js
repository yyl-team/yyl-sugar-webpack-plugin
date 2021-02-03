/*!
 * yyl-sugar-webpack-plugin cjs 1.0.0
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var util = require('yyl-util');
var yylFileReplacer = require('yyl-file-replacer');
var tapable = require('tapable');
var chalk = require('chalk');
var yylWebpackPluginBase = require('yyl-webpack-plugin-base');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const iWeakMap = new WeakMap();
function createHooks() {
    return {
        beforeSugar: new tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
        afterSugar: new tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
        emit: new tapable.AsyncSeriesWaterfallHook(['pluginArgs'])
    };
}
function getHooks(compilation) {
    let hooks = iWeakMap.get(compilation);
    if (hooks === undefined) {
        hooks = createHooks();
        iWeakMap.set(compilation, hooks);
    }
    return hooks;
}

const LANG = {
    SUGAR_INFO: '语法糖替换信息',
    SUGAR_REPLACE: '替换',
    NONE: '无需更新',
    TOTAL: '共更新文件'
};

const PLUGIN_NAME = 'YylSugar';
const SUGAR_REG = /(\{\$)([a-zA-Z0-9@_\-$.~]+)(\})/g;
function sugarReplace(str, alias) {
    return str.replace(SUGAR_REG, (str, $1, $2) => {
        if (typeof alias === 'object') {
            if ($2 in alias) {
                return yylWebpackPluginBase.toCtx(alias)[$2];
            }
            else {
                return str;
            }
        }
        else {
            return str;
        }
    });
}
class YylSugarWebpackPlugin extends yylWebpackPluginBase.YylWebpackPluginBase {
    constructor(option) {
        super(Object.assign(Object.assign({}, option), { name: PLUGIN_NAME }));
        this.output = {};
    }
    /** hooks 用方法: 获取 hooks */
    static getHooks(compilation) {
        return getHooks(compilation);
    }
    /** hooks 用方法: 获取插件名称 */
    static getName() {
        return PLUGIN_NAME;
    }
    render(op) {
        const { dist, source } = op;
        const { alias, assetMap, output } = this;
        const renderMap = {};
        const notMatchMap = {};
        const replaceHandle = (url) => {
            if (url.match(yylFileReplacer.REG.IS_HTTP) ||
                url.match(yylFileReplacer.REG.HTML_IS_ABSLUTE) ||
                url.match(yylFileReplacer.REG.HTML_IGNORE_REG)) {
                return url;
            }
            else {
                let iUrl = url;
                let qh = '';
                const QUERY_HASH_REG = /(^.+)([?#].*)$/;
                if (iUrl.match(QUERY_HASH_REG)) {
                    qh = iUrl.replace(QUERY_HASH_REG, '$2');
                    iUrl = iUrl.replace(QUERY_HASH_REG, '$1');
                }
                let iPath = '';
                if (iUrl.match(SUGAR_REG)) {
                    iPath = util__default['default'].path.relative((output === null || output === void 0 ? void 0 : output.path) || '', sugarReplace(iUrl, alias));
                }
                else {
                    iPath = util__default['default'].path.join(path__default['default'].dirname(dist), iUrl);
                }
                if (typeof (output === null || output === void 0 ? void 0 : output.publicPath) === 'string' && output.publicPath !== 'auto') {
                    if (assetMap[iPath]) {
                        const r = `${util__default['default'].path.join(output.publicPath, assetMap[iPath])}${qh}`;
                        renderMap[url] = r;
                        return r;
                    }
                    else {
                        let r = '';
                        if (path__default['default'].isAbsolute(iPath)) {
                            r = `${iPath}${qh}`;
                        }
                        else {
                            if (iUrl.match(SUGAR_REG)) {
                                r = `${util__default['default'].path.join(output.publicPath, iPath)}${qh}`;
                            }
                            else {
                                r = url;
                            }
                        }
                        notMatchMap[url] = r;
                        return r;
                    }
                }
                else if (output.path) {
                    const relativeBase = util__default['default'].path.relative(path__default['default'].join(output.path, path__default['default'].dirname(dist)), output.path);
                    if (assetMap[iPath]) {
                        const r = `${util__default['default'].path.join(relativeBase, assetMap[iPath])}${qh}`;
                        renderMap[url] = r;
                        return r;
                    }
                    else {
                        let r = '';
                        if (path__default['default'].isAbsolute(iPath)) {
                            r = `${iPath}${qh}`;
                        }
                        else {
                            if (iUrl.match(SUGAR_REG)) {
                                r = `${util__default['default'].path.join(relativeBase, iPath)}${qh}`;
                            }
                            else {
                                r = url;
                            }
                        }
                        notMatchMap[url] = r;
                        return r;
                    }
                }
                else {
                    return url;
                }
            }
        };
        const iExt = path__default['default'].extname(dist);
        let r = source.toString();
        switch (iExt) {
            case '.js':
                r = yylFileReplacer.jsPathMatch(r, replaceHandle);
                break;
            case '.css':
                r = yylFileReplacer.cssPathMatch(r, replaceHandle);
                break;
            case '.html':
                r = yylFileReplacer.htmlPathMatch(r, replaceHandle);
                break;
        }
        return {
            content: Buffer.from(r),
            renderMap,
            notMatchMap
        };
    }
    /** 组件执行函数 */
    apply(compiler) {
        return __awaiter(this, void 0, void 0, function* () {
            const { output } = compiler.options;
            this.output = output;
            const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
            logger.group(PLUGIN_NAME);
            const { compilation, done } = yield this.initCompilation(compiler);
            const iHooks = getHooks(compilation);
            logger.info(LANG.SUGAR_INFO);
            let total = 0;
            let oriDist = '';
            // 排序
            const keys = Object.keys(compilation.assets);
            const cssKeys = keys.filter((x) => path__default['default'].extname(x) === '.css');
            const jsKeys = keys.filter((x) => path__default['default'].extname(x) === '.js');
            const htmlKeys = keys.filter((x) => path__default['default'].extname(x) === '.html');
            const otherKeys = keys.filter((x) => ['.css', '.js', '.html'].indexOf(path__default['default'].extname(x)) === -1);
            const sorkKeys = otherKeys.concat(cssKeys).concat(jsKeys).concat(htmlKeys);
            const assetMapKeys = Object.keys(this.assetMap);
            yield util__default['default'].forEach(sorkKeys, (key) => __awaiter(this, void 0, void 0, function* () {
                const srcIndex = assetMapKeys.map((key) => this.assetMap[key]).indexOf(key);
                let fileInfo = {
                    src: srcIndex === -1 ? undefined : assetMapKeys[srcIndex],
                    source: Buffer.from(compilation.assets[key].source().toString(), 'utf-8'),
                    dist: key
                };
                let renderResult = {
                    content: Buffer.from(''),
                    renderMap: {},
                    notMatchMap: {}
                };
                let urlKeys = [];
                let warnKeys = [];
                switch (path__default['default'].extname(fileInfo.dist)) {
                    case '.css':
                    case '.js':
                    case '.html':
                        fileInfo = yield iHooks.beforeSugar.promise(fileInfo);
                        renderResult = this.render(fileInfo);
                        fileInfo = yield iHooks.afterSugar.promise(fileInfo);
                        // 没任何匹配则跳过
                        urlKeys = Object.keys(renderResult.renderMap);
                        warnKeys = Object.keys(renderResult.notMatchMap);
                        if (!urlKeys.length && !warnKeys.length) {
                            return;
                        }
                        fileInfo.source = renderResult.content;
                        oriDist = fileInfo.dist;
                        if (path__default['default'].extname(oriDist) !== '.html' && fileInfo.src) {
                            fileInfo.dist = this.getFileName(fileInfo.src, renderResult.content);
                        }
                        if (oriDist !== fileInfo.dist && fileInfo.src) {
                            yylWebpackPluginBase.toCtx(this.assetMap)[fileInfo.src] = fileInfo.dist;
                            logger.info(chalk__default['default'].yellow(`# ${LANG.SUGAR_REPLACE} ${oriDist} -> ${fileInfo.dist}:`));
                        }
                        else {
                            logger.info(chalk__default['default'].yellow(`# ${LANG.SUGAR_REPLACE} ${fileInfo.dist}:`));
                        }
                        urlKeys.forEach((key) => {
                            logger.info(`Y ${chalk__default['default'].green(key)} -> ${chalk__default['default'].cyan(renderResult.renderMap[key])}`);
                        });
                        warnKeys.forEach((key) => {
                            logger.warn(`! ${chalk__default['default'].green(key)} -> ${chalk__default['default'].red(renderResult.notMatchMap[key])}`);
                        });
                        total++;
                        /** 更新 assets */
                        this.updateAssets({
                            compilation,
                            oriDist,
                            assetsInfo: fileInfo
                        });
                        break;
                }
            }));
            yield iHooks.emit.promise();
            // - init assetMap
            if (total) {
                logger.info(`${LANG.TOTAL}: ${total}`);
            }
            else {
                logger.info(LANG.NONE);
            }
            logger.groupEnd();
            done();
        });
    }
}
module.exports = YylSugarWebpackPlugin;

exports.default = YylSugarWebpackPlugin;
