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

Defined in: [src/index.ts:89](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L89)

## Properties

### HtmlWebpackPlugin

• `Optional` **HtmlWebpackPlugin**: *undefined* \| *typeof* HtmlWebpackPlugin

Defined in: [src/index.ts:80](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L80)

___

### alias

• **alias**: Alias

Defined in: [src/index.ts:78](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L78)

___

### assetMap

• **assetMap**: ModuleAssets

assetsMap

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:55

___

### context

• **context**: *string*

相对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:49

___

### filename

• **filename**: *string*

输出文件格式

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:53

___

### name

• **name**: *string*

组件名称

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:51

___

### output

• **output**: OutputNormalized

Defined in: [src/index.ts:79](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L79)

## Methods

### addDependencies

▸ **addDependencies**(`op`: AddDependenciesOption): *void*

添加监听文件

#### Parameters:

Name | Type |
------ | ------ |
`op` | AddDependenciesOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:68

___

### apply

▸ **apply**(`compiler`: *Compiler*): *Promise*<*void*\>

组件执行函数

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<*void*\>

Defined in: [src/index.ts:265](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L265)

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

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:60

___

### getFileType

▸ **getFileType**(`str`: *string*): *string*

获取文件类型

#### Parameters:

Name | Type |
------ | ------ |
`str` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:58

___

### initCompilation

▸ **initCompilation**(`op`: YylWebpackPluginBaseInitCompilationOption): *void*

初始化 compilation

#### Parameters:

Name | Type |
------ | ------ |
`op` | YylWebpackPluginBaseInitCompilationOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:62

___

### render

▸ **render**(`op`: [*RenderOption*](../interfaces/renderoption.md)): [*RenderResult*](../interfaces/renderresult.md)

#### Parameters:

Name | Type |
------ | ------ |
`op` | [*RenderOption*](../interfaces/renderoption.md) |

**Returns:** [*RenderResult*](../interfaces/renderresult.md)

Defined in: [src/index.ts:101](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L101)

___

### sugarFile

▸ **sugarFile**(`op`: [*SugarOption*](../interfaces/sugaroption.md)): *Promise*<*undefined* \| { `dist`: *string* ; `source`: *Buffer* ; `src?`: *undefined* \| *string*  }\>

#### Parameters:

Name | Type |
------ | ------ |
`op` | [*SugarOption*](../interfaces/sugaroption.md) |

**Returns:** *Promise*<*undefined* \| { `dist`: *string* ; `source`: *Buffer* ; `src?`: *undefined* \| *string*  }\>

Defined in: [src/index.ts:208](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L208)

___

### updateAssets

▸ **updateAssets**(`op`: UpdateAssetsOption): *void*

更新 assets

#### Parameters:

Name | Type |
------ | ------ |
`op` | UpdateAssetsOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:66

___

### getHooks

▸ `Static`**getHooks**(`compilation`: *Compilation*): *any*

hooks 用方法: 获取 hooks

#### Parameters:

Name | Type |
------ | ------ |
`compilation` | *Compilation* |

**Returns:** *any*

Defined in: [src/index.ts:82](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L82)

___

### getName

▸ `Static`**getName**(): *string*

hooks 用方法: 获取插件名称

**Returns:** *string*

Defined in: [src/index.ts:87](https://github.com/jackness1208/yyl-sugar-webpack-plugin/blob/0ff4c17/src/index.ts#L87)
