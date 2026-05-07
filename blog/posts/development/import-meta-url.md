---
date: 2026-04-29 00:00:00
updated: 2026-05-07 17:53:15
category: Development
tags:
  - FrontEnd
  - Study
  - JavaScript
title: " import.meta.url 是啥子？"
description: 从 ECMAScript 规范角度全面理解 import.meta 与 import.meta.url，涵盖浏览器、Node.js、Deno、Bun 各宿主环境的差异与约定，以及在 Vite 等构建工具中的实际应用。
---

# `import.meta.url` 是啥子？

我一直不太清楚 `import.meta.url` 到底是怎么来的，总觉得它是个黑魔法。直到某天我翻开了 ECMAScript 规范，才发现 —— 原来人家是 ESM 的正规军，正儿八经的语言特性 👮。

今天就从头捋一捋：`import.meta` 从哪来、各环境有啥区别、实战中怎么用。

## `import.meta`：规范只给了一个空壳子 🐚

翻开 [ECMAScript 语言规范](https://tc39.es/ecma262/#sec-meta-properties)，你会发现整个语言里只有两个**元属性（Meta Property）**：

- `new.target` — 判断构造函数有没有被 `new` 调用
- `import.meta` — 我们的主角

语法上长这样：

```bnf
MetaProperty ::=  import . meta
```

几个硬性规定，得背下来：

- `import` 在这里**不是关键字**，而是 `MetaProperty` 的起始标记（~~语法糖呗~~）
- **只能在模块代码中使用**，在传统 Script 里用？直接给你 `SyntaxError` 💥
- 关键是：**规范本身不定义它有哪些属性**，这事儿全交给宿主环境决定

简单说：语言标准就搭了个骨架，肉长什么样，由运行时说了算。

## 设计哲学：Host Hooks，各家装各家的修 🏠

ECMA-262 定义了一个抽象操作 `HostGetImportMetaProperties`：

> **HostGetImportMetaProperties(importMeta, moduleRecord)** 是宿主环境实现的抽象操作。宿主通过这个 Hook 往 `import.meta` 对象上注入属性。

这就好比房东给了你一间毛坯房，装修成啥样全看你自己：

```
ECMAScript 规范:
  └── import.meta 是一个空对象

浏览器 (HTML Spec):
  └── 注入 url, resolve

Node.js:
  └── 注入 url, resolve, dirname, filename

Deno:
  └── 注入 url, main, resolve

Bun:
  └── 注入 url, resolve, dir, file, path, env
```

所以下次有人再说"`import.meta` 是哪个框架的私有财产"，你可以微笑着告诉他：**这是 ECMAScript 标准的 API，只不过各家往里塞的东西不一样** 😎

## 各家塞了些啥？我们来逐个看看

### 浏览器

根据 [WHATWG HTML Spec](https://html.spec.whatwg.org/multipage/webappapis.html#hostgetimportmetaproperties)，浏览器只给了两个属性，非常克制：

```js
// 当前模块的绝对 URL
console.log(import.meta.url);
// → 'https://example.com/js/app.js'

// 基于当前模块解析相对路径
const resolved = import.meta.resolve('./helper.js');
// → 'https://example.com/js/helper.js'
```

- **`url`**：当前模块的完整绝对 URL（类型 `string`）
- **`resolve`**：一个函数，把相对路径解析成基于当前模块的绝对 URL。Chrome/Edge 105+、Firefox 106+、Safari 16.4+ 开始支持

### Node.js

Node.js 在浏览器基础上，加了一堆 CJS 时代的老朋友：

```js
// Node.js ESM 模式

console.log(import.meta.url);
// → 'file:///Users/alice/project/src/index.mjs'

console.log(import.meta.dirname);
// → '/Users/alice/project/src'

console.log(import.meta.filename);
// → '/Users/alice/project/src/index.mjs'
```

- **`dirname`**：等价于 CJS 的 `__dirname`（Node.js 21.2+）
- **`filename`**：等价于 CJS 的 `__filename`（Node.js 21.2+）
- **`resolve`**：行为类似浏览器版，但走的是 Node.js 的模块解析算法（会在 `node_modules` 里翻）

> 如果还在用 21.2 以下的 Node.js，也别慌，自己手搓一手：
> ```js
> import { fileURLToPath } from 'url';
> import { dirname } from 'path';
> const __filename = fileURLToPath(import.meta.url);
> const __dirname = dirname(__filename);
> ```
> ~~好家伙，又回到了手写 CJS 兼容层的年代~~

### Deno

```js
import.meta.url;    // → 'file:///...' | 'https://...'
import.meta.main;   // → true 如果当前模块是入口模块
import.meta.resolve('./x.ts');
```

`main` 是 Deno 的特色属性，类似 Python 的 `if __name__ == '__main__'`，用来判断当前模块是不是入口文件，挺实用的。

### Bun

```js
import.meta.url;     // → 'file:///...'
import.meta.dir;     // → 目录路径
import.meta.file;    // → 当前文件名
import.meta.path;    // → 完整文件路径
import.meta.env;     // → Bun.env 的访问器
```

Bun 最"霸道"，直接塞了四个路径相关属性再加一个 `env`，~~不愧是"我全都要"的运行时~~。

## 为什么 ESM 不直接使用 `__dirname`

这个问题我当年也困惑过，CJS 时代多爽啊，直接 `__dirname` 就拿当前目录了。到了 ESM，还得绕个弯：

| 需求 | CJS 方案 | ESM 方案 |
|------|----------|----------|
| 获取当前文件路径 | `__filename`, `__dirname` | `import.meta.url` + `fileURLToPath` |
| 基于当前模块解析路径 | `require.resolve()` | `import.meta.resolve()` |
| 获取模块元信息 | 无标准方式 | `import.meta.url` 统一入口 |
| 判断是否为入口模块 | `require.main === module` | `import.meta.main`（Deno） |

原因其实挺简单：

1. **全局变量污染**：`__dirname` 在 CJS 里是通过函数包装注入的，本质上不算真正的全局变量，但这套在浏览器里就行不通了
2. **浏览器兼容性**：`__dirname` 在浏览器中没有意义，而 `import.meta.url` 用统一的 URL 格式覆盖所有环境，从 `file://` 到 `https://` 全通吃
3. **可扩展性**：`import.meta` 作为可扩展对象，宿主随便往里加东西，比不断新增全局变量优雅得多

## 跨环境通用约定

### `import.meta.url` 必须是绝对 URL

不管模块是从本地文件系统加载、HTTP 远程加载、还是 data URI，`import.meta.url` 始终是绝对形式。这就保证了基于它的路径解析永远不会迷路 🗺️。

### `new URL(relative, import.meta.url)` 是最稳的模式

由于 `import.meta.url` 是绝对 URL，而 `URL` 构造函数在所有现代运行时上都有，这个模式就成了获取同目录资源的**通用、可靠、标准**方式：

```ts
// 引用同目录下的配置文件——跨环境通用，稳如老狗 🐶
const configPath = new URL('./config.json', import.meta.url);
```

浏览器里得到 `http://...`，Node.js 里得到 `file:///...`，都能直接传给对应的 I/O API。

### `import.meta.resolve()` 的标准化趋势

`import.meta.resolve()` 最初是浏览器专用，现在已经成了所有主流 ESM 宿主环境的标准配置。语义是**相对于当前模块解析模块说明符**，返回绝对 URL。

不过各家的返回类型有差异：
- 浏览器：返回字符串
- Node.js：返回 URL 对象（可用 `.href` 拿字符串）
- 规范允许返回任何对象，只要 `toString()` 能返回有效 URL

### 自定义属性的命名约定

由于 `import.meta` 是可变对象，宿主可以动态加属性。社区有个默契：自定义属性最好用大写或特殊前缀，避免以后冲突。比如 Vite 的 `import.meta.env`、`import.meta.hot` 就是典型。

## 构建工具中的实际应用

前端构建工具（Vite、Webpack、Rollup）在开发阶段保留 `import.meta` 的语义，但在生产构建时会把相关模式**静态替换**成最终路径。

### Vite 中的常见用法

```ts
// 1. 引用同目录静态资源
const imgUrl = new URL('./logo.png', import.meta.url).href;
// 开发: http://localhost:5173/src/logo.png
// 构建: /assets/logo.a1b2c3d4.png

// 2. 创建 Web Worker
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});
```

Vite 构建时会**静态分析** `new URL(..., import.meta.url)` 这种模式，替换成生产环境的最终资源路径并自动加哈希。但这里有个坑：路径参数必须是**字面量字符串**，不能是变量，否则 Vite 就没法静态解析了 —— 我第一次踩到这坑的时候，控制台直接报了警告 🤦。

```ts
// ❌ 这样不行
const name = './logo.png';
new URL(name, import.meta.url);

// ✅ 必须这样
new URL('./logo.png', import.meta.url);
```

### 构建工具的通用约束

- 把 `import.meta.url` 替换成绝对资源路径字符串
- 把 `new URL(relative, import.meta.url)` 整体替换成构建后的资源 URL
- 无法静态分析的动态用法会直接警告

这套约定保证了代码在不同部署环境（ESM、CJS、IIFE）下都能正常跑。~~果然，各家框架偷偷约好了一起玩这套~~

## 总结

一条主线贯穿全文：

> **`import.meta` 是 ECMAScript 规范定义的元属性，由宿主环境决定具体属性内容；`import.meta.url` 是所有宿主环境都支持的、表示当前模块绝对 URL 的共同约定。**

理解这一点后，不管是写浏览器端代码、Node.js 工具链，还是配置 Vite 构建，都能对 `import.meta.url` 的来龙去脉心中有数。

下次面试官问起来，你可以淡定地甩一句："这是 ECMAScript 的元属性，由 `HostGetImportMetaProperties` Hook 实现，各家注入的属性不同……" 然后看他目瞪口呆的样子 😄

---

### 参考

- [ECMAScript Language Specification — Meta Properties](https://tc39.es/ecma262/#sec-meta-properties)
- [WHATWG HTML Spec — HostGetImportMetaProperties](https://html.spec.whatwg.org/multipage/webappapis.html#hostgetimportmetaproperties)
- [Node.js — import.meta](https://nodejs.org/api/esm.html#importmeta)
- [Vite — Static Asset Handling](https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url)