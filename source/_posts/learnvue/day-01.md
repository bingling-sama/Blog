---
tags: [Vue, FrontEnd, HTML, JavaScript, CSS]
title: Vue.js 学习笔记 Day-01   
date: 2022-07-20 21:57:53   
---

# Vue.js 学习笔记 Day-01
咕咕咕了很久很久的冰凌终于良心发现准备开始恢复博客的更新了，想了很久要写点什么主题的文章，正好身边有朋友在学习前端，我也早就打算复习打磨一下自己的前端技术，所以就开坑了这个系列。   
废话就讲到这里，咱们直接开始 Vue.js 之旅吧！

## Vue.js 是什么？ *What is Vue?*
> 此处摘录 [Vue.js 中文文档](https://v3.cn.vuejs.org/) 的描述     

Vue (读音 /vjuː/，类似于 **view**) 是一套用于构建用户界面的**渐进式框架**。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与[现代化的工具链](https://v3.cn.vuejs.org/guide/single-file-component.html)以及各种[支持类库](https://github.com/vuejs/awesome-vue#components--libraries)结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。   

----

停停停，这里有个专业名词：**渐进式框架**。那么渐进式框架是什么意思呢？   
渐进式从字面意义上来理解，就是一步一步的进行。而 Vue.js 本身只提供了 Vue 生态中最核心的组件系统和数据绑定，其余的功能都是通过添加库进行使用的，比如 `Vuex`/`Vue Router`。所以 Vue 是一种渐进式的前端开发框架。
如果你以前有了解过其他前端开发框架的话，比如 `React`/`Angular` ，可以看看下面的对比。

|Vue.js|React|Angular|
|:-:|:-:|:-:|
|本体只含有 Vue Component & Data Bind | 必须学习函数式编程 | 必须使用模块机制 |
| 所有额外功能通过 Vue-cli 插件添加 | 需要理解、避免副作用 | 必须使用依赖注入 |
| 自定义性强，易于上手 | 需要理解什么是纯函数 | 必须以 Angular 形式定义组件 |

渐进式框架这种特性，使得它在学习成本和使用难度上来说都是更优解。比如刚开始学习 Vue 的我们，一开始只需要掌握 Vue 最基础的功能特性就可以直接上手使用 Vue 了，后续再慢慢深入学习其他的 Vue 库。

## 如何使用？ *How to use?*
Vue.js 的设计初中就包含渐进式的采用，所以它可以以多种方式集成到项目中：
- 在 HTML 中使用 CDN 包的方式进行导入
- 下载编译后的 JavaScript 文件自行托管
- 使用包管理器进行安装
- 使用 Vue 官方提供的脚手架进行项目构建 （高级应用）
- 使用 Vite 进行项目构建 （高级应用）

### CDN 引用
在一些小体量的需求处，可以直接这样引用 Vue ：
```html
	<script src="https://unpkg.com/vue@next"></script>
```
需要注意的是，如果在生产环境中这样使用，建议链接到一个明确的版本号，以避免新版本更新造成的破坏。

### 自行托管
如果不使用 CDN ，那么你可以下载编译后的 `.js` 文件自行托管在服务器，并使用`<script>` 标签引用。你可以在 [unpkg](https://unpkg.com/browse/vue@next/dist/) 或者 [jsDelivr](https://cdn.jsdelivr.net/npm/vue@next/dist/) 这些 CDN 上下载各种不同文件，通常需要同时下载开发环境构建版本以及生产环境构建版本。

### 包管理器
在大型项目中，你会用到包管理器，Vue 同样支持。
```shell
# npm
$ npm install vue@next

# yarn yes
$ yarn add vue@next
```
在某些轻量需求中，还可以使用 Vue 的编译器来制作单文件组件：
```shell
# npm
$ npm install -D @vue/compiler-sfc

# yarn yes
$ yarn global add @vue/compiler-sfc
```
> 如果你使用过 Vue 2 ，请注意 `@Vue-compiler-sfc` 替换掉了  `vue-template-compiler`

除了 `@vue/compiler-sfc` 以外，你还需要一个单文件组件 loader/plugin ，后面会单独讲到。

这里先就讲这三种使用方式，剩余的我们会在后面进行深入学习

### Hello World!
讲了这么多，你应该已经跃跃欲试了，这里有一个 [示例](https://codepen.io/team/Vue/pen/KKpRVpx) ，你可以先阅读一下，下一期我们就来一起学习一下这个示例。