---
date: 2022-08-21 11:07:35
updated: 2024-10-29 21:33:02
category: Development
tags:
  - FrontEnd
title: 配置 ESLint + Prettier 环境来规范代码风格
description: 记录一次在前端项目中配置 ESLint + Prettier 来规范代码风格的过程。
---

# 配置 `ESLint` + `Prettier` 环境来规范代码风格

前端开发过程中，每个人都有自己的代码风格，但项目中应该将代码风格统一，所以我习惯用 `ESLint` + `Prettier` 来格式化代码。

## 介绍

`ESLint` 是一个 `JavaScript` 代码检测工具，用以进行一系列代码质量检测。

`Prettier` 是一个前端代码格式化工具，用以进行代码格式化操作。

但 `ESLint` 的格式化支持的文件类型较少，所以我喜欢配合 `Prettier` 来进行格式化。

## 配置 `ESLint`

### 安装 `ESLint`

```shell
# yarn yes!
yarn add eslint

# npm
npm i -D eslint
```

### 初始化 `ESLint`

```shell
eslint --init
```

此处根据你的项目具体情况回答几个问题，`ESLint` 就会自己乖乖生成配置文件了。

### 配置脚本

```json
// package.json
{
...
  "scripts": {
    "lint": "eslint --fix ./**"
  }
...
}
```

再执行 `yarn lint` 就可以进行错误检测和格式化啦~

## 配置 `Prettier`

由于 `ESLint` 和 `Prettier` 的格式化功能有冲突，所以我们需要使用 `ESLint` 插件来关闭 `ESLint` 的格式化功能，防止 `Prettier` 和 `ESLint` 冲突。

### 安装 `Prettier` 及 `ESLint` 插件

```shell
yarn add prettier eslint-plugin-prettier eslint-config-prettier
```

### 修改 `ESLint` 配置文件

```json
// .eslintrc.json
...
  "extends": [
    "plugin:prettier/recommended"
  ]
...
```

### 配置 `Prettier`

在项目根目录新建 `.prettierrc` 文件

```json
{
  "printWidth": 80, // 自动换行长度
  "tabWidth": 2, // 制表符大小
  "useTabs": true, // Tab 缩进
  "singleQuote": true, // 单引号
  "semi": false, // 行末分号
  "trailingComma": "none", // 尾逗号
  "bracketSpacing": true // 大括号环绕空格 eg.{ foo }
}
```

### 配置脚本

```json
// package.json
...
  "scripts": {
    "format": "prettier --write ."
  }
...
```

## 配置 `VSCode`

上面的配置都是进行运行时检测，为了我们的写码体验，可以安装一些 `VSCode` 插件来实时检测。

### 安装 `VSCode ESLint` 插件

```txt
名称: ESLint   
ID: dbaeumer.vscode-eslint   
说明: Integrates ESLint JavaScript into VS Code.   
版本: 2.2.6   
发布者: Microsoft   
[VS Marketplace 链接](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)    
这个插件将会自动用项目根目录下的 `.eslintrc.*` 配置文件来格式化代码
```

### 安装 `VSCode Prettier` 插件

```txt
名称: Prettier - Code formatter   
ID: esbenp.prettier-vscode   
说明: Code formatter using prettier   
版本: 9.8.0   
发布者: Prettier   
[VS Marketplace 链接](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)    
```

### 安装 `VSCode Prettier ESLint` 插件

```txt
名称: Prettier ESLint
ID: rvest.vs-code-prettier-eslint
说明: A Visual Studio Extension to format JavaScript and Typescript code using prettier-eslint package
版本: 5.0.4
发布者: Rebecca Vest
[VS Marketplace 链接](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
```

### 修改 `VSCode` 设置

```json
{
  "editor.defaultFormatter": "rvest.vs-code-prettier-eslint", //  默认使用 prettier 作为格式化工具
  "editor.formatOnSave": true // 保存代码时格式化
}
```

## 配置完成🎉

接下来就可以愉快写码啦~
