/// <reference types="node" />
import { Compilation, Compiler, WebpackOptionsNormalized } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { YylWebpackPluginBase, YylWebpackPluginBaseOption, ModuleAssets } from 'yyl-webpack-plugin-base';
declare type Output = WebpackOptionsNormalized['output'];
export declare type YylSugarWebpackPluginOption = Pick<YylWebpackPluginBaseOption, 'context' | 'filename'> & {
    HtmlWebpackPlugin?: typeof HtmlWebpackPlugin;
};
export declare type YylSugarWebpackPluginProperty = Required<YylSugarWebpackPluginOption>;
export interface RenderOption {
    dist: string;
    source: Buffer;
}
export interface RenderResult {
    content: Buffer;
    renderMap: ModuleAssets;
    notMatchMap: ModuleAssets;
}
/** sugar 文件信息 */
export interface SugarOption {
    fileInfo: {
        /** 文件原地址 */
        src?: string;
        /** 文件输出地址 */
        dist: string;
        /** 文件内容 */
        source: Buffer;
    };
    compilation: Compilation;
    hooks: any;
}
export interface InitEmitHooksResult {
    assetMap: ModuleAssets;
    compilation: Compilation;
    done: (error?: Error) => void;
}
export default class YylSugarWebpackPlugin extends YylWebpackPluginBase {
    output: Output;
    HtmlWebpackPlugin?: typeof HtmlWebpackPlugin;
    /** hooks 用方法: 获取 hooks */
    static getHooks(compilation: Compilation): any;
    /** hooks 用方法: 获取插件名称 */
    static getName(): string;
    constructor(option?: YylSugarWebpackPluginOption);
    render(op: RenderOption): RenderResult;
    sugarFile(op: SugarOption): Promise<SugarOption['fileInfo'] | undefined>;
    /** 组件执行函数 */
    apply(compiler: Compiler): Promise<void>;
}
export {};
