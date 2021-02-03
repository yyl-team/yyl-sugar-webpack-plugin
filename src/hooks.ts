import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compilation } from 'webpack'
const iWeakMap = new WeakMap()

export function createHooks() {
  return {
    beforeSugar: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterSugar: new AsyncSeriesWaterfallHook(['pluginArgs']),
    emit: new AsyncSeriesWaterfallHook(['pluginArgs'])
  }
}

export function getHooks(compilation: Compilation) {
  let hooks = iWeakMap.get(compilation)
  if (hooks === undefined) {
    hooks = createHooks()
    iWeakMap.set(compilation, hooks)
  }
  return hooks
}
