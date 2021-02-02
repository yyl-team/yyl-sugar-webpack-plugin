/// <reference types="node" />
import { Compilation, Compiler, WebpackOptionsNormalized } from 'webpack';
import { YylWebpackPluginBase, YylWebpackPluginBaseOption, ModuleAssets } from './base';
declare type Output = WebpackOptionsNormalized['output'];
export declare type YylSugarWebpackPluginOption = Pick<YylWebpackPluginBaseOption, 'context' | 'filename'>;
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
export interface InitEmitHooksResult {
    assetMap: ModuleAssets;
    compilation: Compilation;
    done: (error?: Error) => void;
}
export default class YylSugarWebpackPlugin extends YylWebpackPluginBase {
    output: Output;
    /** hooks 用方法: 获取 hooks */
    static getHooks(compilation: Compilation): any;
    /** hooks 用方法: 获取插件名称 */
    static getName(): string;
    constructor(option?: YylSugarWebpackPluginOption);
    render(op: RenderOption): RenderResult;
    /** 组件执行函数 */
    apply(compiler: Compiler): Promise<void>;
}
export {};
