---
categories: [Development]
tags: [Vue, FrontEnd, HTML, JavaScript, CSS]
title: Vue.js 学习笔记 Day-01
date: 2022-07-21 21:52:42
---

# Vue.js 学习笔记 Day-01
咕咕咕了很久很久的冰凌终于良心发现准备开始恢复博客的更新了，想了很久要写点什么主题的文章，正好身边有朋友在学习前端，我也早就打算复习打磨一下自己的前端技术，所以就开坑了这个系列。   
废话就讲到这里，咱们直接开始 Vue.js 之旅吧！

# Vue.js 是什么？ *What is Vue?*
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

### Hello World!
讲了这么多，你应该已经跃跃欲试了，Vue 官方提供了一个 [示例](https://codepen.io/team/Vue/pen/KKpRVpx) ，接下来我们就来一起学习一下这个示例。

CSS 代码不看，我们先来看看 HTML 部分：
```html
<div id="hello-vue" class="demo">
  {{ message }}
</div>
```
这里为 `<div>` 标签指定了一个 `id` 属性，我们将会通过这个 id 来挂载我们的 Vue 应用。而 `{{ message }}` 则是 Vue 的特殊语法：**模板语法** ，使用双花括号来声明我们要在此处渲染的数据。模板语法体现了 Vue.js 是使用 **声明式渲染** 来绑定数据与 DOM 的。

```js
# 新建 Vue 实例
const HelloVueApp = {
  data() {
    return {
      message: 'Hello Vue!!'
    }
  }
}

# 挂载 Vue 应用
Vue.createApp(HelloVueApp)
   .mount('#hello-vue')
```
可以看到，创建一个 Vue 应用是十分简单的，只需要短短两行代码就可以声明并挂载一个 Vue 应用。需要注意的是，此处的 `data` 选项是一个函数，这与其他的配置项不同，我们以后也会深入讲解。   
Vue 的数据绑定是 **响应式** 的，这意味着我们对于 `message` 的值的任何更改都会实时地渲染到视图中，你可以尝试添加以下代码来验证数据与 DOM 之间的关联：
```js
# 新建 Vue 实例
const HelloVueApp = {
  data() {
    return {
		counter
    }
  },
  mounted() {
    setInterval(() => {
	  this.counter++
    }, 1000)
  }
}

# 挂载 Vue 应用
Vue.createApp(HelloVueApp)
   .mount('#hello-vue')
```

```html
<div id="hello-vue" class="demo">
  Counter: {{ counter }}
</div>
```

