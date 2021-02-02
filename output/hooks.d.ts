import { AsyncSeriesWaterfallHook } from 'tapable';
import { Compilation } from 'webpack';
export declare function createHooks(): {
    beforeSugar: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
    afterSugar: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
    emit: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
};
export declare function getHooks(compilation: Compilation): any;
