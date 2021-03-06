# 历史版本

## 1.0.10 (2021-06-26)

- fix: 修复 生成 sugar 文件后 会多出一份未被 sugar 的文件

## 1.0.9 (2021-04-05)

- fix: 去掉不必要的 log

## 1.0.8 (2021-04-05)

- feat:更新 `yyl-webpack-plugin-base@0.2.2`
- fix: 修复 在 window 系统下 通过 yyl-concat-webpack-plugin 生成的 文件不能被正确映射的问题

## 1.0.7 (2021-04-05)

- del: 去掉 console

## 1.0.6 (2021-03-09)

- feat:调整 `html-webpack-plugin` 为 `devDependencies`

## 1.0.5 (2021-03-07)

- feat:更新 `yyl-webpack-plugin-base@0.2.1`

## 1.0.4 (2021-03-06)

- feat:更新 `yyl-webpack-plugin-base@0.1.8`
- feat: 调整 sugar 实现方式

## 1.0.3 (2021-02-04)

- feat: 更新 `yyl-webpack-plugin-base@0.1.5`
- feat: 补充 docs

## 1.0.2 (2021-02-04)

- feat: 更新 `yyl-webpack-plugin-base@0.1.2`

## 1.0.0 (2021-02-03)

- feat: 兼容 webpack 5

## 0.1.14 (2020-05-14)

- fix: 修复 当 js 有 sugar 需要替换，而正好 html 引入了这个 js 时，会出现 hash 不对的情况

## 0.1.13 (2020-03-10)

- fix: 修复路径匹配 'path/to/font.tff?1234#aerf' 时结果不符合预期的问题

## 0.1.12 (2020-03-10)

- fix: 修复路径匹配 'path/to/font.tff' 时结果不符合预期的 bug

## 0.1.11 (2020-03-09)

- feat: 优化 log

## 0.1.10 (2020-03-09)

- fix: 修复 修改 chunk 以后 文件 hash 没改变的问题
- fix: 修复 路径替换 当 sugar 为 '/' 绝对路径时， 路径替换不符合预期问题

## 0.1.9 (2020-03-05)

- fix: 修复当 chunks 里面包含热更新 `hot-update` 时，生成出来的文件不符合预期的问题

## 0.1.8 (2020-03-05)

- feat: 匹配失败时改为输出 路径替换后的原地址

## 0.1.7 (2020-03-05)

- feat: 补充 匹配失败信息
- fix: 修复当 {$cssDest} 匹配不到对应的 assets 文件时，输出异常问题

## 0.1.6 (2020-02-26)

- fix: 修复路径匹配 `//www.testhost.com` 时结果不符合预期的 bug

## 0.1.5 (2020-02-23)

- feat: 细化 log

## 0.1.4 (2020-02-20)

- feat: 补充注释

## 0.1.2 (2020-02-16)

- feat: 补充 无需更新情况

## 0.1.1 (2020-02-16)

- feat: 补充 log 信息

## 0.1.0 (2020-02-03)

- feat: 诞生
