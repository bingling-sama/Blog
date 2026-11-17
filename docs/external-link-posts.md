# 发布外链文章

在 `blog/posts/` 下创建 Markdown 文件，像普通文章一样提交。示例：

```markdown
---
title: 原文标题
date: 2026-11-13 12:00:00
description: 写一两句自己的推荐理由。
category: Development
tags:
  - 推荐阅读
externalLink: https://example.com/article
sourceAuthor: 原作者
---
```

- `externalLink` 是类型开关；不填写这个字段就是普通文章。不能写空值。
- `title`、`date`、`description` 对外链文章必填；日期表示你推荐的时间。
- `sourceAuthor` 可选；未知时省略，不填本站作者代替。
- `category`、`tags` 沿用现有习惯，不会自动添加推荐标签。
- 只允许绝对 HTTP(S) 地址，不允许相对路径、其他协议、带用户名密码或含未编码空格/控制字符的地址。
- 正文可以留空；有更多评论时直接写在 frontmatter 后。页面会自动生成标题、推荐语和来源区，无需重复手写。

## 发布后的行为

首页、归档、分类和标签列表显示推荐标识，点击标题在新标签页直达原文，不显示阅读时长。推荐计入现有文章数量。

站内记录页保留，包含推荐日期、推荐语、作者、来源、原文入口和版权说明；不会自动跳转。RSS 条目主链接指向原文，GUID 保留站内记录地址，因此修改原文链接不会产生新的条目身份。

Telegram 通知主链接仍指向站内记录页，简介包含原文链接和原作者。新增文章的自动通知规则不变；修改已有推荐不会自动触发新增文章通知。

## 检查与测试

以下测试命令使用 Node.js 26.13.1+（当前 LTS；单元测试直接加载 TypeScript 渲染插件）。

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
node scripts/notify-teleblog.mjs --dry-run blog/posts/development/recommend-example.md
```

非法外链会阻止构建和对应通知，并在错误中给出文件与字段。

完整端到端回归需要安装 [uv](https://docs.astral.sh/uv/) 与 Playwright Chromium：

```sh
uv run --with playwright python -m playwright install chromium
pnpm test:external-posts
```

回归会创建临时测试文章，验证根路径和 `/sub/` 部署、RSS、站内记录页、所有列表、本地搜索、键盘打开行为，以及深浅主题下 280/320/414/1280px 的布局和外链交互状态对比度。浏览器回归拦截非本地请求，原文目标使用测试响应；通知仅运行 dry-run。测试结束自动删除临时源文件，成功时再构建一次不含测试内容的生产输出；截图位置打印在终端。

需求与验收标准见 [Spec](./specs/external-link-posts.md)。
