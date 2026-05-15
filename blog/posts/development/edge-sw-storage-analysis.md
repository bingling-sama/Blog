---
title: 是谁在我的 Edge 里吃了 4 个 G？
date: 2026-05-07
categories: Development
tags:
  - FrontEnd
  - System
  - Browser
  - Rust
  - Node.js
  - Edge
updated: 2026-05-15 09:37:44
---

最近我 MacBook 的硬盘空间频频告急，作为一个每天都在跟代码打交道的开发者，我第一个想到的当然是 `node_modules` 和 Docker 镜像。然而清了一遍之后，空间依然捉襟见肘。

于是一个 ~~摸鱼~~ 的下午，我祭出了 [mole](https://github.com/ahgamut/mole) 这个用 Rust 写的终端磁盘分析工具，打算彻底搞清楚到底是谁在偷我的硬盘。结果一扫描，一个意想不到的选手浮出水面：

**Edge 浏览器，5 个 G。**

好家伙，一个浏览器而已，用得着囤这么多东西吗？你是打算在我硬盘上安家落户吗？😅

## 真凶：Service Worker 下的 CacheStorage

顺着 `mole` 的结果往下 drill，我发现占用大头主要集中在下面这个目录：

```
~/Library/Application Support/Microsoft Edge/Default/
```

更具体的，是 `Default/CacheStorage/` 和 `Default/Service Worker/` 这两个目录。CacheStorage 里面有大量以 ID 命名的文件夹，每个里面都有 `.db` 和 `.blob` 文件，完全不知道对应的是哪个网站或扩展。

我平时 Edge 使用频率很高，标签页常年几十个开着。这种情况下，想肉眼看出哪个网站的 Service Worker 在疯狂缓存，简直是不可能的事情。

不过 Chromium 内核的浏览器有个好处 —— 它内置了几个"上帝视角"的调试页面：

| 内部页面                             | 用途                          |
| -------------------------------- | --------------------------- |
| `edge://quota-internals`         | 查看所有 Origin 的存储占用明细         |
| `edge://serviceworker-internals` | 查看所有注册的 Service Worker 及其状态 |
| `edge://extensions`              | 扩展程序列表及其 ID                 |

通过这几个页面，理论上可以把每个存储块跟具体的网站或扩展对应起来。但问题是 —— 这些页面是给人看的，不是给机器读的。几百个 Origin 一个个手动对照，那不是要累死？🤦‍♂️

作为一个懒人程序员，我决定写个工具来自动化这个过程。

## 技术方案设计

我和 Gemini 讨论了一下，梳理出了一个相对完整的方案。核心思路是 **采集→解析→关联→报告** 四层解耦：

```text
┌─────────────────────────────────┐
│          驱动层 (Bash)           │  ← 进程锁检查、环境清理
├─────────────────────────────────┤
│        采集层 (Node.js + Playwright) │  ← 模拟用户行为，绕过 edge:// 限制
├─────────────────────────────────┤
│          引擎层 (Rust)           │  ← 高性能解析、关联分析、异常识别
├─────────────────────────────────┤
│         表现层 (Rust/Bash)       │  ← 终端报表 & 清理建议
└─────────────────────────────────┘
```

### 采集层：绕过沙盒限制

普通的网页 API 只能看到自己域下的数据，但 `edge://quota-internals` 是浏览器的"特权页面"，可以扫描所有域。关键在于：

- **必须使用非无头模式**（`headless: false`），否则特权页面渲染不完整
- **必须挂载真实 Profile 路径**（`launchPersistentContext`），否则看到的是空数据
- 采集两个关键页面的 HTML 快照：
  - `edge://quota-internals` → 存储占用数据
  - `edge://serviceworker-internals` → SW 注册状态
- 额外采集 `edge://extensions` → Extension ID ↔ 名称映射表

### 解析层：HTML 转结构化数据

采集到的 HTML 页面结构复杂，直接分析不现实。需要解析成结构化的 JSON 数据：

- 统一单位（全部转为 Bytes，显示时动态换算 MiB/GiB）
- URL 规范化（拆分协议、域名、端口）
- 以 Origin / Storage Key 为主键组织数据

### 关联层：交叉比对与异常检测

这是整个工具的核心。单纯的存储数据只能告诉你"谁占了空间"，但结合 Service Worker 的状态才能知道"为什么占"。我设计了几种检测规则：

| 检测类型 | 判断依据 | 风险等级 |
| --- | --- | --- |
| **孤儿存储 (Orphaned)** | `Usage > 0` 但无活跃 SW 注册 | ⚠️ 中 |
| **缓存膨胀 (Cache Bloat)** | `CacheStorage / TotalUsage > 90%` 且总占用超 500MB | 🔴 高 |
| **扩展残留 (Extension Residue)** | `chrome-extension://` 协议但扩展已卸载 | 🗑️ 僵尸 |

### 报告层：清理指引

针对检测出来的问题，生成对应的清理建议。每条建议包含 `Storage.clearDataForOrigin()` 的 CDP 命令供参考（但不自动执行，确保安全）。

## 两个小时出活

技术方案定下来后，我把整个方案丢给了 Codex。大概两个小时后，一个能跑的 MVP 就出来了。

这里得坦白一下技术选型上的一个小插曲。我当时在 Rust 和 Node.js 之间，倾向选了 Rust 做引擎层。老实说这个场景的数据量根本用不到 Rust 的高性能，几百 KB 的 HTML 用 cheerio 绰绰有余。选 Rust 纯粹是个人偏好，~~外加想练练手~~。不过 `scraper` crate 和 `comfy-table` crate 确实好用，后者画出来的终端表格比手撸 ASCII 美多了。

手动调了几轮之后，工具跑起来是这样的效果：

```text
Parsed: 4 quota records, 2 service workers, 1 extensions
Total usage: 712.00 MiB

Top Storage Consumers
┌─────────────────────────────────┬────────────┬──────────────┬───────────┐
│ Origin                          ┆ Usage      ┆ CacheStorage ┆ Kind      │
╞═════════════════════════════════╪════════════╪══════════════╪═══════════╡
│ https://example.com             ┆ 640.00 MiB ┆ 600.00 MiB   ┆ Website   │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌┤
│ chrome-extension://missing999   ┆ 18.00 MiB  ┆ 18.00 MiB    ┆ Extension │
└─────────────────────────────────┴────────────┴──────────────┴───────────┘

Orphaned Storage Candidates
┌───────────────────────────────┬───────────┬──────────────┬───────────┐
│ Origin                        ┆ Usage     ┆ CacheStorage ┆ Kind      │
╞═══════════════════════════════╪═══════════╪══════════════╪═══════════╡
│ https://orphan.test           ┆ 12.00 MiB ┆ 1.00 MiB     ┆ Website   │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌┤
│ chrome-extension://missing999 ┆ 18.00 MiB ┆ 18.00 MiB    ┆ Extension │
└───────────────────────────────┴───────────┴──────────────┴───────────┘

Cache Bloat Risk Candidates
┌─────────────────────┬────────────┬──────────────┬─────────┐
│ Origin              ┆ Usage      ┆ CacheStorage ┆ Kind    │
╞═════════════════════╪════════════╪══════════════╪═════════╡
│ https://example.com ┆ 640.00 MiB ┆ 600.00 MiB   ┆ Website │
└─────────────────────┴────────────┴──────────────┴─────────┘

Cleanup Guidance
- Inspect and clear site data for https://orphan.test from Edge settings.
- Inspect and clear site data for chrome-extension://missing999 from Edge settings.
- Inspect and clear site data for https://example.com from Edge settings.
```

MVP 验证通过，测试数据能正确检测出孤儿存储、扩展残留和缓存膨胀。接下来就是真刀真枪上场了。

## 飞书你干得好啊

我把脚本指向了我的真实 Edge Profile 目录，按下回车，几秒后结果就出来了。

Edge 一共吃掉了 **5 个多 G**。

其中，**3.9G 来自飞书网页版**。

我本来还怀疑是哪个浏览器扩展出了 bug，有内存泄漏问题或者保存了过多的日志，结果没想到是飞书干的好事。

其实我一开始使用的是飞书桌面客户端，但是也经常发现它会囤积更新数据，占用的储存有时能达到 **10个G** 以上，所以我切换到了网页版，没想到它一个网页端竟然也能给我存近 4G 的数据……

我想飞书的 Service Worker 大概是这种逻辑：

```javascript
// 纯属脑补，不代表真实代码
self.addEventListener('fetch', event => {
  // 管他三七二十一，先缓存了再说
  event.respondWith(cacheThenNetwork(event.request))
  // 清理策略？那是什么，能吃吗？
})
```

也不是不能理解。飞书作为协作办公平台，文件、图片、聊天记录、文档协作数据量本来就大。用 CacheStorage API 做离线缓存确实能提升体验 —— 但这个膨胀幅度属实有点离谱了。三个月前的对话附件和头像，真的有必要一直留在本地吗？😅

## 总结

这次折腾，从发现问题到最后定位真凶，大概花了一个下午 + 一个晚上。回头看看，整个过程挺有意思的：

1. **问题发现**：`mole` 扫盘 → Edge 5GB 异常占用
2. **线索追踪**：手动查看 `edge://` 内部页面 → 锁定 CacheStorage 和 Service Worker
3. **方案设计**：四层解耦架构，数据采集 + 交叉比对 + 异常检测
4. **极速实现**：Codex 生成 MVP，手动调优
5. **终极结果**：抓到真凶 —— 飞书网页版 3.9G

写工具的过程本身也值回票价了。说实话，如果不写这个工具，我可能永远想不到要去 `edge://quota-internals` 看一眼，大概只会粗暴地清理全站数据完事。而有了工具之后，不仅精准定位到冤大头，还顺带发现了一些已卸载扩展的残留文件。

后续如果有时间，我打算把这个工具再打磨一下 —— 加个跨浏览器支持（Chrome/Brave 也就改几个路径和 URL），再搞个 HTML 可视化报告。不过现在嘛，先把飞书的缓存清了再说 🏃‍♂️💨

工具我也已经开源到 [GitHub](https://github.com/bingling-sama/swsx) 了，感兴趣的可以去玩一下，不过目前还非常毛坯，需要再打磨一段时间，欢迎大家提出 issue，我 ~~应该~~ 会及时响应。

---

*如果你也好奇自己的 Edge 到底被什么网站悄悄吃掉了硬盘，不妨打开 `edge://quota-internals` 看一眼。说不定也会有"惊喜" 🙃*