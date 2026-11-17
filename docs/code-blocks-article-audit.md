# 文章代码块使用建议

审阅日期：2026-11-17。功能提交：`1679407`。

本次只审阅代码块的阅读体验，不改文章正文，不检查各篇教程所依赖 API 的时效性。
以下行号均指审阅时 Markdown 源文件中的代码围栏起始行；代码块内部行号从围栏下一行开始计数，空行也计入。

## 覆盖范围

- 正式文章 24 篇，包含 1 篇外链推荐记录。
- 正式文章共有 191 个 fenced code blocks，其中 21 个为 Mermaid 图表，普通代码/文本块 170 个。
- 普通代码/文本块中，14 个达到 30 行及以上，分布在 8 篇文章中。
- 额外对 `.drafts` 下 12 份草稿做了代码块结构扫描，长片段和发布前建议单独列出。
- 没有因行数长就统一加折叠；正文正在解释的核心代码应该先让读者看见。

## 使用取舍

| 内容角色 | 建议 |
| --- | --- |
| 前文已经拆解过的完整实现、安装全过程日志、冗长目录树 | 优先 `:collapsed-lines=10` 或 `::: details` |
| 读者需要逐项查阅、复制的配置文件 | 优先 `:height=28rem`，不要默认藏起来 |
| 当前正在解释的状态、边界条件、清理逻辑、配置键 | 优先 `{行号}` 行高亮 |
| 同一段代码从旧写法改为新写法 | 可考虑 diff；保留明确上下文 |
| 两种合法方案、不同运行时、不同部署模式的比较 | 分块展示，不用红绿增删暗示对错 |
| 短命令、短示例、Mermaid 图表 | 通常保持原样 |

高度是建议起点，最终需结合文章在桌面和手机上的实际排版调整。
除特别长的完整实现外，不默认同时设置折叠和限高，减少重复操作。

## 优先处理的长片段

下表完整列出正式文章中 30 行及以上的 14 个普通代码/文本块。

| 文章与位置 | 内容长度 | 建议 | 原因与注意事项 |
| --- | ---: | --- | --- |
| [React 须知](../blog/posts/design/design2dev/04-react-state-and-interactions.md#L533)，L533 | 229 行 | `tsx :collapsed-lines=12 :height=36rem` | 前文已逐步拆解，末尾的完整组装不应把后续排查清单推到很远；展开后仍提供有限高度的查阅区 |
| [React 须知](../blog/posts/design/design2dev/04-react-state-and-interactions.md#L460)，L460 | 60 行 | `tsx{1,4-6,10-20,25,40,44} :height=32rem` | 联合状态、状态转换和渲染分流是教学主体，不折叠；当前代码块内部的这些行对应核心逻辑 |
| [React 须知](../blog/posts/design/design2dev/04-react-state-and-interactions.md#L123)，L123 | 36 行 | `tsx{2-7,9,29}`，不折叠 | 当前段落重点是 Props 接口、函数入参与回调绑定，样式字符串不是阅读焦点 |
| [Tokens 与组件状态](../blog/posts/design/design2dev/03-design-tokens-and-component-states.md#L163)，L163 | 41 行 | `css :height=28rem` | 完整 Token 字典适合滚动查阅；浅色和深色模式都是正确配置，不用 diff |
| [Tokens 与组件状态](../blog/posts/design/design2dev/03-design-tokens-and-component-states.md#L344)，L344 | 57 行 | `tsx{6-9,11-32,48-52} :height=32rem` | 突出基础交互状态、变体声明和 loading/disabled 处理；这是本节主例，不默认折叠 |
| [React 组件封装](../blog/posts/development/component-encapsulation.md#L74)，L74 | 45 行 | `tsx{11-12,20,23,26,29-32} :height=28rem` | 突出副作用入口、过期结果保护和 cleanup；不因长就把关键清理逻辑藏起来 |
| [XPREM 自建热更新](../blog/posts/development/eas-self-host.md#L193)，L193 | 44 行 | `yaml{12-13,18-22,25-27} :height=30rem` | 这是可直接参考的部署配置，限高比折叠合适；强调签名文件、Expo 关联与密钥路径；“不要配置 DB_URL”的说明继续放正文中 |
| [XPREM 自建热更新](../blog/posts/development/eas-self-host.md#L287)，L287 | 68 行 | `yaml{42-44} :height=32rem` | 完整 Compose 需要保留查阅入口；突出启用控制平面的 DB_URL 与两组 Secret |
| [XPREM 自建热更新](../blog/posts/development/eas-self-host.md#L421)，L421 | 33 行 | `typescript{11,17,20-25,28-30}`，可选 `:height=30rem` | runtimeVersion、更新 URL、验签和请求头是接入契约；不要默认折叠 |
| [Edge 存储分析](../blog/posts/development/edge-sw-storage-analysis.md#L102)，L102 | 32 行 | `text :height=24rem` | 终端报告是结果展示，不是逐行教程；保留报告开头，后半部分滚动查看；其中孤儿存储与清理建议也有信息，不宜直接藏掉 |
| [Lottie Web](../blog/posts/development/lottie-in-web.md#L185)，L185 | 30 行 | `tsx{6,15-19,21-26}`，不折叠 | 控制实例引用、事件及两个控制动作都是本节重点；代码长度尚可，先高亮而非强制限高 |
| [Storybook + Vite on Bun](../blog/posts/development/storybook-init.md#L161)，L161 | 72 行 | 命令单列，完整日志用 `::: details 安装过程日志` | 绝大多数是安装输出；但 L202–210 包含需手动处理的 Vitest setup 提示，必须先在正文保留，再折叠日志 |
| [Storybook + Vite on Bun](../blog/posts/development/storybook-init.md#L240)，L240 | 45 行 | `text :collapsed-lines=12` | 图片素材清单不是集成步骤的重点；目录输出更适合 `text` 而不是 `bash` |
| [Web 缓存体系](../blog/posts/development/web-cache.md#L157)，L157 | 39 行 | `nginx{9-10,15,25,33-37} :height=30rem` | HTML 协商缓存、静态资源强缓存、代理缓存的差异是本节主体；保留可见，不默认折叠 |

行高亮范围是具体候选，不要求一次性全部标注。一个代码块里高亮过多会重新失去重点，
实际改稿时应结合紧邻正文，把同一阅读步骤最重要的几行优先留下。

## 适合展示修改过程的位置

### Storybook 的增量配置

[storybook-init.md](../blog/posts/development/storybook-init.md)：

- L122 的 `vite.config.ts` 明确写着“新增以下配置”，可用 `ts{9-15}`，或给新加的 `build.lib` 部分标 `// [!code ++]`。
- L356 与 L373 的 `package.json` 是同一文件的修改前后，适合合并成一个变更示例，突出 `dev`、`build`、类型构建和 Storybook 构建脚本。
- JSON 的纯配置示例优先用围栏行高亮，不为了标记 diff 把 `//` 注释塞进合法 JSON。要展示完整补丁，可另外使用 `diff` 块，并保留最终可复制配置。
- 这里只建议改善呈现，不代表两段配置中的脚本已经做过完整一致性审查。

### React 的事件绑定和派生数据

[04-react-state-and-interactions.md](../blog/posts/design/design2dev/04-react-state-and-interactions.md)：

- L237 的 `onClick={openDetails()}` → `onClick={openDetails}` 是非常合适的最小 diff：读者一眼就能看到括号的区别。
- 带参数的箭头函数版本是另一种正确用法，应单独保留，不标为“再次替换”。
- L298 与 L313 是从冗余状态到派生数据的重构，可用小型 diff 展示“删掉重复状态，增加现场计算”；不必把两段整体都染红染绿。
- L173 与 L197 的普通变量 → `useState` 可以加高亮或补充最小 diff，但两个完整示例本身都很短，不折叠。
- L406 的稳定 Key 示例可直接用 `tsx{3}`，无需额外引入一段虚构的旧代码。

### 定位锚点修复

[02-read-code-skeleton.md](../blog/posts/design/design2dev/02-read-code-skeleton.md#L234)，L234：

- 错误与正确示例的核心区别仅是父容器增加 `relative`。
- 可以对比父容器那一行，使用 diff；也可以保留原有两组 HTML，改成 `html{2,7}`。
- Flexbox 与 Grid 是布局方案对比，不是同一行的修复，不建议统一改成 diff。

### D1 绑定兼容

[counter.md](../blog/posts/project/counter.md#L201)，L201：

- 最小修复是 `const db = env.DB || env.counter_db`，优先 `typescript{1-6}` 或只高亮第一行。
- 如果补充 diff，应只对真实的旧绑定读取逻辑展示变更；不要把 `wrangler.toml` 的 `counter_db` 标成必须删除，因为正文选的是兼容它，而不是改名。

## 其余正式文章的逐篇结论

与长片段表合起来，以下覆盖全部 24 篇正式文章。

| 文章 | 建议 |
| --- | --- |
| [学习路线图](../blog/posts/design/design2dev/00-learning-roadmap.md) | 不折叠。L161 可高亮 Props 接口与 `trend` 条件呈现；L186 可高亮状态声明及打开/关闭回调。路线图与状态树完整保留 |
| [重新理解 Figma](../blog/posts/design/design2dev/01-re-understand-figma.md) | L161、L173 是两种图层命名与组织的对照，分别只有 7、10 行，保留并排逻辑顺序；不必改 diff，也不折叠 |
| [读懂代码骨架](../blog/posts/design/design2dev/02-read-code-skeleton.md) | 除定位修复外，L113 可高亮 `box-sizing`；L177 可高亮 `grid-template-columns` 和 `grid-column`；L280 突出响应式断点所在行。所有片段均短，不限高 |
| [移动应用图标设计](../blog/posts/design/expo-app-icon-design.md) | L97、L110、L127 三个配置块先补 `json` 语言，再高亮 `icon`、Adaptive Icon 和 Splash 的核心字段；不折叠 |
| [字体系统推荐](../blog/posts/design/typo-in-vibe-coding.md) | 外链推荐记录，没有本地代码块，不调整 |
| [Mac Android SDK 与模拟器](../blog/posts/development/android-dev-without-android-studio.md) | 22 个代码块都很短。L87 用 `bash{2-3,6}` 突出 SDK 根目录与 PATH 优先级；L122 可高亮 ARM64 镜像。错误提示、验证命令和预期输出保持完整可见 |
| [区块链技术简介](../blog/posts/development/block-chain.md) | 没有 fenced code blocks，不调整 |
| [React 组件封装](../blog/posts/development/component-encapsulation.md) | 除副作用示例外，L36 突出 `onChange` 接口与通知；L132 突出 Provider value 与 Hook 的越界检查；L164 突出消费 Hook。Context 的声明和消费是配套代码，不用 diff |
| [XPREM 自建热更新](../blog/posts/development/eas-self-host.md) | 除三段长配置外，L380 用 `nginx{15}` 突出上传限制；L251 突出 `EXPO_TOKEN` 与 `unset EOO_TOKEN`；L475 突出灰度比例参数。两种部署模式是合法选型，不合并成红绿 diff |
| [Edge 存储分析](../blog/posts/development/edge-sw-storage-analysis.md) | 只对完整报告限高。L153 的 6 行伪代码带明确“脑补”说明，不折叠，也不加 diff 造成真实源码修复的错觉 |
| [ESLint + Prettier](../blog/posts/development/eslint-prettier.md) | 全部片段只有 1–9 行，不折叠。L72 高亮 extends 配置，L99 高亮 format 脚本，L148 高亮默认格式化器。已有注释的配置片段可考虑标 `jsonc`，但不扩展成本次工具版本迁移 |
| [前端工程化初见](../blog/posts/development/frontend-engineering.md) | 没有 fenced code blocks，不调整 |
| [import.meta.url](../blog/posts/development/import-meta-url.md) | L166 的 2 行核心模式保持直出；L193 可高亮静态资源 URL 与 Worker 创建；L207 的动态路径与字面量示例适合对照高亮，不必折叠。不同宿主属性不是增删关系，不做 diff |
| [Lottie Web](../blog/posts/development/lottie-in-web.md) | L98 可高亮 `loadAnimation` 和 `destroy` 清理；L157 高亮 Hook 解构与控制动作；L185 见长片段表。不同接入方案本来就在分节教学，不统一折叠 |
| [JavaScript OOP 与 FC](../blog/posts/development/oop-and-fc-in-js.md) | 先把 L98、L105、L116、L249、L262、L293 中误标为 `ini` / `css` 的 JS 改成 `javascript`，否则新高亮能力不能正确体现。L116 的 28 行是四种原型操作的教学对照，优先高亮各关键调用，不折叠；命令式与声明式都合法，不用红绿暗示前者错误 |
| [React Native 与 Expo 渲染原理](../blog/posts/development/react-native-expo-rendering.md) | 片段最长仅 12 行，不折叠。L57 突出 state 与 `onPress`；L201 突出创建视图和属性设置；L250、L264 对齐高亮导出的模块名和方法。Swift 与 Kotlin 是平台对照，不是 diff |
| [Storybook + Vite on Bun](../blog/posts/development/storybook-init.md) | 除长日志和目录外，L46 创建向导也可预览 8 行；L73 的初始目录可折叠；L102、L290 的局部结构保持直出；L323 最终目录可预览 12 行，并高亮 components 和导出入口。L143 依赖安装输出较短，可保持原样 |
| [var 与 let](../blog/posts/development/var-vs-let.md) | 4 段只有 7–12 行，不折叠。L21 高亮函数外访问的两行；L40 高亮重声明；L54、L71 高亮初始化前访问。`var` 与 `let` 是语义对比，不应全部改成替换 diff |
| [Web 缓存体系](../blog/posts/development/web-cache.md) | 除 Nginx 配置外，L64 高亮 Cache-Control，L203 高亮 HTML 与静态资源的 header 指令。Mermaid 时序图不加代码块参数 |
| [GitHub 学生包](../blog/posts/life/github-student-pack.md) | 没有 fenced code blocks，不调整 |
| [Windows 小鹤双拼](../blog/posts/life/xiaohe.md) | 唯一的 PowerShell 片段只有 3 行，不折叠、不限高；主要是长行问题，纵向限高不能解决，保留水平滚动即可 |
| [Cloudflare 计数器](../blog/posts/project/counter.md) | L113 的 27 行 SQL 可选 `:height=28rem`，但主键与 offset 是讲解主体，优先高亮；L145 高亮 `INSERT OR IGNORE`、`ON CONFLICT` 与 UV 条件绑定。错误响应和成功响应很短，保持可见 |

## 草稿的补充扫描

草稿尚未发布，下面仅是呈现建议，不表示技术方案已经通过完整技术审查。

### Docker Operations Agent MVP

[docker-operations-agent-mvp-technical-solution.md](../blog/posts/.drafts/projects/ops-agent/docker-operations-agent-mvp-technical-solution.md)：

- L1167，41 行项目树：适合 `text :collapsed-lines=12`。
- L1706，26 行 Demo 终端输出：可用 `text :height=24rem`，或在正文先保留诊断与验证结果，再折叠完整过程。
- L287，34 行 `AgentState`：这是方案的核心契约，不建议折叠；可限高并突出 observations、plan、approval、verification 与状态枚举。
- L1527，25 行配置：高亮审批要求以及 stop/remove/exec 的禁用设置；这些是安全边界，不隐藏。

### Unified Operations Agent

[unified-operations-agent-technical-solution.md](../blog/posts/.drafts/projects/ops-agent/unified-operations-agent-technical-solution.md)：

- L1371，45 行项目树：适合 `text :collapsed-lines=14`。
- L766，31 行审批记录：可限高，但 Current/Target、Affected、Risk 和 Expected Impact 不应该默认藏在折叠区。
- L651，21 行 Rego：用高亮区分默认拒绝、审批分支和高危拒绝；不是修改前后，不用 diff。
- L1026，23 行审计事件链：是解释流程的正文材料，保持可见。
- 本文的大量 Mermaid 图表不纳入普通代码块折叠。

### 其他草稿

- `information- security/day02.md`：唯一的 18 行 Python 示例可高亮模板拼接和渲染调用，不折叠。
- `information- security/day03.md`：唯一的 8 行 Python 示例保持可见，不折叠。
- `information- security/day12.md`：唯一的 1 行 PowerShell 示例保持原样。
- `improvements.md`、`information- security/day01.md`、`day04.md`、`day05.md`、`day06.md`、`day07.md`、`day10.md`：没有 fenced code blocks，无需应用这些增强。

## 建议执行顺序

先处理 React 完整实现、Storybook 日志/目录、XPREM 长配置；
随后补核心讲解行的高亮，并修正漏填或误填的代码语言；
最后逐个确认是否真的需要 diff，不为了用新功能重写原有教学结构。

验收时重点检查：折叠是否遮住正文刚引用的代码、配置是否仍能完整复制、
错误提示是否仍然可见、手机端是否出现重复滚动操作。
