[yyl-sugar-webpack-plugin](../README.md) / [Exports](../modules.md) / default

# Class: default

## Hierarchy

* *YylWebpackPluginBase*

  ↳ **default**

## Table of contents

### Constructors

- [constructor](default.md#constructor)

### Properties

- [HtmlWebpackPlugin](default.md#htmlwebpackplugin)
- [alias](default.md#alias)
- [assetMap](default.md#assetmap)
- [context](default.md#context)
- [filename](default.md#filename)
- [name](default.md#name)
- [output](default.md#output)

### Methods

- [addDependencies](default.md#adddependencies)
- [apply](default.md#apply)
- [getFileName](default.md#getfilename)
- [getFileType](default.md#getfiletype)
- [initCompilation](default.md#initcompilation)
- [render](default.md#render)
- [sugarFile](default.md#sugarfile)
- [updateAssets](default.md#updateassets)
- [getHooks](default.md#gethooks)
- [getName](default.md#getname)

## Constructors

### constructor

\+ **new default**(`option?`: [*YylSugarWebpackPluginOption*](../modules.md#yylsugarwebpackpluginoption)): [*default*](default.md)

#### Parameters:

Name | Type |
------ | ------ |
`option?` | [*YylSugarWebpackPluginOption*](../modules.md#yylsugarwebpackpluginoption) |

**Returns:** [*default*](default.md)

Defined in: src/index.ts:88

## Properties

### HtmlWebpackPlugin

• `Optional` **HtmlWebpackPlugin**: *undefined* \| *typeof* HtmlWebpackPlugin

Defined in: src/index.ts:79

___

### alias

• **alias**: Alias

resolve.alias 绝对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:57

___

### assetMap

• **assetMap**: ModuleAssets

assetsMap

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:59

___

### context

• **context**: *string*

相对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:51

___

### filename

• **filename**: *string*

输出文件格式

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:55

___

### name

• **name**: *string*

组件名称

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:53

___

### output

• **output**: OutputNormalized

Defined in: src/index.ts:78

## Methods

### addDependencies

▸ **addDependencies**(`op`: AddDependenciesOption): *void*

添加监听文件

#### Parameters:

Name | Type |
------ | ------ |
`op` | AddDependenciesOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:72

___

### apply

▸ **apply**(`compiler`: *Compiler*): *Promise*<*void*\>

组件执行函数

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<*void*\>

Defined in: src/index.ts:263

___

### getFileName

▸ **getFileName**(`name`: *string*, `cnt`: *Buffer*, `fname?`: *string*): *string*

获取文件名称

#### Parameters:

Name | Type |
------ | ------ |
`name` | *string* |
`cnt` | *Buffer* |
`fname?` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:64

___

### getFileType

▸ **getFileType**(`str`: *string*): *string*

获取文件类型

#### Parameters:

Name | Type |
------ | ------ |
`str` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:62

___

### initCompilation

▸ **initCompilation**(`compiler`: *Compiler*): *Promise*<InitEmitHooksResult\>

初始化 compilation

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<InitEmitHooksResult\>

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:66

___

### render

▸ **render**(`op`: [*RenderOption*](../interfaces/renderoption.md)): [*RenderResult*](../interfaces/renderresult.md)

#### Parameters:

Name | Type |
------ | ------ |
`op` | [*RenderOption*](../interfaces/renderoption.md) |

**Returns:** [*RenderResult*](../interfaces/renderresult.md)

Defined in: src/index.ts:100

___

### sugarFile

▸ **sugarFile**(`op`: [*SugarOption*](../interfaces/sugaroption.md)): *Promise*<*undefined* \| { `dist`: *string* ; `source`: *Buffer* ; `src?`: *undefined* \| *string*  }\>

#### Parameters:

Name | Type |
------ | ------ |
`op` | [*SugarOption*](../interfaces/sugaroption.md) |

**Returns:** *Promise*<*undefined* \| { `dist`: *string* ; `source`: *Buffer* ; `src?`: *undefined* \| *string*  }\>

Defined in: src/index.ts:206

___

### updateAssets

▸ **updateAssets**(`op`: UpdateAssetsOption): *void*

更新 assets

#### Parameters:

Name | Type |
------ | ------ |
`op` | UpdateAssetsOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:70

___

### getHooks

▸ `Static`**getHooks**(`compilation`: *Compilation*): *any*

hooks 用方法: 获取 hooks

#### Parameters:

Name | Type |
------ | ------ |
`compilation` | *Compilation* |

**Returns:** *any*

Defined in: src/index.ts:81

___

### getName

▸ `Static`**getName**(): *string*

hooks 用方法: 获取插件名称

**Returns:** *string*

Defined in: src/index.ts:86
