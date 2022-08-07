# 如何使用？ *How to use?*
Vue.js 的设计初中就包含渐进式的采用，所以它可以以多种方式集成到项目中：
- 在 HTML 中使用 CDN 包的方式进行导入
- 下载编译后的 JavaScript 文件自行托管
- 使用包管理器进行安装
- 使用 Vue 官方提供的脚手架进行项目构建 （高级应用）
- 使用 Vite 进行项目构建 （高级应用）

## CDN 引用
在一些小体量的需求处，可以直接这样引用 Vue ：
```html
	<script src="https://unpkg.com/vue@next"></script>
```
需要注意的是，如果在生产环境中这样使用，建议链接到一个明确的版本号，以避免新版本更新造成的破坏。

## 自行托管
如果不使用 CDN ，那么你可以下载编译后的 `.js` 文件自行托管在服务器，并使用`<script>` 标签引用。你可以在 [unpkg](https://unpkg.com/browse/vue@next/dist/) 或者 [jsDelivr](https://cdn.jsdelivr.net/npm/vue@next/dist/) 这些 CDN 上下载各种不同文件，通常需要同时下载开发环境构建版本以及生产环境构建版本。

## 包管理器
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
