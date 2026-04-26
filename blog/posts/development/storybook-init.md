---
date: 2025-04-06 16:53:49
updated: 2026-04-26 17:18:26
category: Development
tags:
  - FrontEnd
title: Storybook + Vite on Bun
description: 记录一下在 Bun 上将 Storybook 集成到 Vite 组件库项目中的过程
---
# Storybook 集成

## 什么是 Storybook

Storybook 是一个开源工具，用于独立构建、测试和文档化 UI 组件。它为开发者提供了一个独立于主应用程序的环境，使组件开发更加高效和有条理。

## 主要特点

- **隔离环境**：在应用程序上下文之外开发 UI 组件
- **组件驱动开发**：专注于一次构建一个组件
- **可视化测试**：直观地检查组件在不同状态下的外观
- **交互式文档**：创建活跃的、可交互的组件文档
- **插件生态系统**：通过众多插件扩展功能

## 使用场景

- 创建设计系统或组件库
- 开发复杂的 UI 界面
- 测试组件的边缘情况
- 协作开发（设计师和开发者）

## 项目集成

Storybook 的 cli 貌似不太好用，这边提供一个将 Storybook 与 Vite 项目集成的方案。

### 环境要求

- bun
- React ≥ 16.8
- Vite ≥ 4.0
- Storybook ≥ 8.0

### 创建项目

```bash
$ bun create vite
reused 0, downloaded 1, added 1, done
|
o  Project name:
|  storybook-demo
|
o  Select a framework:
|  React
|
o  Select a variant:
|  TypeScript + SWC
|
o  Scaffolding project in D:\Projects\storybook-demo...
|
—  Done. Now run:

  cd storybook-demo
  bun install
  bun run dev

$ bun install
...
```

项目结构：

```bash
$ tree
.
|-- README.md
|-- eslint.config.js
|-- index.html
|-- package.json
|-- public
|   `-- vite.svg
|-- src
|   |-- App.css
|   |-- App.tsx
|   |-- assets
|   |   `-- react.svg
|   |-- index.css
|   |-- main.tsx
|   `-- vite-env.d.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
`-- vite.config.ts

3 directories, 15 files
```

vite create 默认没有创建库项目的选项，下面我们将这个项目改造成库项目。

先删掉 `src/` 下的 css、ts 和资源文件，创建一个空的 `index.ts` 文件，现在项目结构长这样：

```bash
$ tree
.
|-- README.md
|-- eslint.config.js
|-- index.html
|-- package.json
|-- src
|   |-- index.ts
|   `-- vite-env.d.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
`-- vite.config.ts

2 directories, 11 files
```

修改 `vite.config.ts` 文件，将项目类型改为库项目：

```ts
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 新增以下配置
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'my-components',
      formats: ['es'],
    }
  }
})
```

记得安装一下 sass 依赖，我们接下来要使用 scss 编写样式：

```bash
$ bun add -D sass-embedded
Packages: +20
++++++++++++++++++++
Progress: resolved 483, reused 403, downloaded 7, added 20, done

devDependencies:
+ sass-embedded 1.86.3

Done in 7.2s
```

现在就是一个 React 库项目咯，可以开始集成 Storybook 了。

### 集成 Storybook

安装 Storybook：

```bash
// 安装 Storybook 时会调用 npm 安装一些包，如果 npm 环境有问题可以加上 --package-manager=bun
$ bun create storybook@latest
╭───────────────────────────────────────────────────────╮
│                                                       │
│   Adding Storybook version 8.6.12 to your project..   │
│                                                       │
╰───────────────────────────────────────────────────────╯
√ What do you want to use Storybook for? » Documentation: MDX, auto-generated component docs, Testing: Fast browser-based component tests, watch mode
 • Detecting project type. ✓
Installing dependencies...

Lockfile is up to date, resolution step is skipped
Already up to date
Done in 678ms
 • Adding Storybook support to your "React" app • Detected Vite project. Setting builder to Vite. ✓

  ✅ Getting the correct version of 0 packages
. ✓
Installing dependencies...

Lockfile is up to date, resolution step is skipped
Already up to date
Done in 750ms
> npx storybook@8.6.12 add @storybook/experimental-addon-test@8.6.12
Verifying @storybook/experimental-addon-test
Installing @storybook/experimental-addon-test@^8.6.12
Adding '@storybook/experimental-addon-test@8.6.12' to the "addons" field in .storybook\main.ts
Running postinstall script for @storybook/experimental-addon-test

╭ 👋 Howdy! ─────────────────────────────────────────────────────────────────╮
│                                                                            │
│   I\'m the installation helper for @storybook/experimental-addon-test       │
│                                                                            │
│   Hold on for a moment while I look at your project and get it set up...   │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯

› Configuring Playwright with Chromium (this might take some time):
  npx playwright install chromium --with-deps

╭ 🚨 Oh no! ──────────────────────────────────────────────────────────────╮
│                                                                         │
│   Found an existing Vitest setup file:                                  │
│   D:/Projects/storybook-demo/.storybook/vitest.setup.ts                 │
│                                                                         │
│   Please refer to the documentation to complete the setup manually:     │
│   https://storybook.js.org/docs/writing-tests/test-addon#manual-setup   │
│                                                                         │
╰─────────────────────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────────╮
│                                                                              │
│   Storybook was successfully installed in your project! 🎉                   │
│   Additional features: Documentation, Testing                                │
│                                                                              │
│   To run Storybook manually, run bun run storybook. CTRL+C to stop.         │
│                                                                              │
│   Wanna know more about Storybook? Check out https://storybook.js.org/       │
│   Having trouble or want to chat? Join us at https://discord.gg/storybook/   │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯

Running Storybook

> storybook-demo@0.0.0 storybook D:\Projects\storybook-demo
> storybook dev -p 6006 "--initial-path=/onboarding" "--quiet"

@storybook/core v8.6.12

info => Serving static files from D:\Projects\storybook-demo\node_modules\.cache\storybook\default\coverage at /coverage
info Using tsconfig paths for react-docgen
17:58:40 [vite] (client) hmr update /@id/__x00__virtual:/@storybook/builder-vite/vite-app.js
```

这里会自动打开 Storybook 的欢迎页面，按照指引操作即可。（注意让你命名新 stories 时不要和已有的 stories 重名）

完成上述操作以后的项目结构如下：

```bash
$ tree -F -I "node_modules"
.
|-- README.md
|-- eslint.config.js
|-- index.html
|-- package.json
|-- bun-lock.yaml
|-- src/
|   |-- index.ts
|   |-- stories/
|   |   |-- Button.stories.ts
|   |   |-- Button.tsx
|   |   |-- Configure.mdx
|   |   |-- Header.stories.ts
|   |   |-- Header.tsx
|   |   |-- Page.stories.ts
|   |   |-- Page.tsx
|   |   |-- assets/
|   |   |   |-- accessibility.png
|   |   |   |-- accessibility.svg
|   |   |   |-- addon-library.png
|   |   |   |-- assets.png
|   |   |   |-- avif-test-image.avif
|   |   |   |-- context.png
|   |   |   |-- discord.svg
|   |   |   |-- docs.png
|   |   |   |-- figma-plugin.png
|   |   |   |-- github.svg
|   |   |   |-- share.png
|   |   |   |-- styling.png
|   |   |   |-- testing.png
|   |   |   |-- theming.png
|   |   |   |-- tutorials.svg
|   |   |   `-- youtube.svg
|   |   |-- button.css
|   |   |-- header.css
|   |   `-- page.css
|   `-- vite-env.d.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
`-- vitest.workspace.ts

3 directories, 38 files
```

我们先暂时忽略一下 `src/stories/` 目录，在 `src/components` 中创建 `Button` 文件夹并添加如下几个文件：

```bash
$ tree ./src/components/Button/
./src/components/Button/
|-- Button.scss
|-- Button.stories.ts
|-- Button.test.ts
|-- Button.tsx
`-- index.ts

0 directories, 5 files
```

`Button.tsx` 文件可以直接复制 `stories/Button.tsx` 的内容，只要将首行的 import 语句导入的样式文件后缀名改成 `scss` 即可，`Button.stories.ts` 文件可以直接复制 `stories/Button.stories.ts` 的内容，`Button.scss` 文件也可以直接复制 `stories/Button.css` 的内容，因为 scss 是 css 的超集，可以无缝转换 ，`Button.test.ts` 文件暂时先不管，这里是组件测试的代码，笔者还没研究。

现在在 `src\Button\index.ts` 中导出组件：

```ts
import { Button } from './Button';

export default Button;
export type { ButtonProps } from './Button';
```

在 `src/index.ts` 中导出组件：

```ts
export { default as Button } from './components/Button';
```

现在可以把 `src/stories` 目录删掉啦，需要抄的代码已经抄完了，可以不用它了。删掉之前可以先看一看 `src\stories\Configure.mdx` 的内容，学习一下怎么使用 MDX 书写组件库文档。

完成后的项目结构：

```bash
$ tree -F -I "node_modules"
.
|-- README.md
|-- eslint.config.js
|-- index.html
|-- package.json
|-- bun-lock.yaml
|-- src/
|   |-- components/
|   |   `-- Button/
|   |       |-- Button.scss
|   |       |-- Button.stories.ts
|   |       |-- Button.test.ts
|   |       |-- Button.tsx
|   |       `-- index.ts
|   |-- index.ts
|   `-- vite-env.d.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
`-- vitest.workspace.ts

3 directories, 17 files
```

现在就已经可以愉快的书写组件库啦😋，接下来我们来看看 Storybook 的使用。

### Storybook 使用

在重构项目结构以后，打开 `package.json`，可以看到现在的脚本如下：

```json
{
  ...,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  ...
}
```

由于现在的项目是一个库项目，无法直接使用 `vite` 命令运行，所以我们可以稍作修改：

```json
{
  ...,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "lint": "eslint .",
    "build": "bun run build:js && bun run build:types && bun run build:css",
    "build:js": "vite build",
    "build:types": "tsc --emitDeclarationOnly",
    "build:storybook": "storybook build"
  },
  ...
}
```

现在运行 `bun dev` 就可以直接启动 Storybook 开发服务器啦，快去试试吧🎉
