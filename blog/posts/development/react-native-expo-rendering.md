---
date: 2026-04-26 00:00:00
updated: 2026-04-26 01:34:21
title: React Native 和 Expo 的渲染原理
description: 记录一下 React Native 和 Expo 在移动端到底是怎么把前端代码跑到手机上的
category: Development
tags:
  - FrontEnd
  - Mobile
  - ReactNative
  - Expo
---

# React Native 和 Expo 的渲染原理

答应大家下次要分享前端技术在移动端、跨端领域的应用，所以这次给大家带来 RN 和 Expo 的技术分享。

相信大家刚刚开始看 React Native 和 Expo 的时候，和我一样一直有一个问题：

> 为什么我写的是 React 组件，最后却能直接在手机上显示出来？

这个问题看起来不复杂，但真要往下追，就会牵扯到很多东西。React、React Native、Expo、Metro、iOS、Android，这些概念如果放在一起看，很容易让人混掉。

所以今天我主要想讲清楚的是：React Native 到底是怎么把前端代码渲染到手机上的，Expo 又在这个过程中负责什么。

## React Native 的是干啥滴

首先，什么是 React Native 的渲染？

React Native 的本职工作，是把 React 代码变成移动端的原生视图。它不是在手机上跑一个网页，也不是把 HTML 页面包起来再显示出来，而是把 JSX 描述的结构，转成 iOS 和 Android 能直接处理的原生组件。

也就是说，开发者写出来的并不是最终画面本身，而是一份 UI 描述。React Native 负责把这份描述翻译成平台原生控件，最后再由 iOS 和 Android 把界面画到屏幕上。

这一点和 Web 里的 React 很不一样。Web React 最终面对的是 DOM，而 React Native 面对的是原生视图。两者都使用 React 的写法，但落到的目标完全不同。

## React Native 里的 UI 不是 DOM！

那么其次，React Native 和 Web React 的区别到底在哪里？

最直接的区别，就是它们最终渲染的目标不同。Web 上的 React 需要把组件渲染到 DOM 里，React Native 需要把组件渲染到原生控件里。

例如一个输入框，在 iOS 上会对应到 `UITextField` 一类的原生控件，在 Android 上会对应到对应平台的输入组件。开发者写的是同一套 React 组件，但真正执行渲染的是不同平台自己的 UI 系统。

这也是 React Native 和 Web 最大的差异之一。React Native 并没有把移动端做成一个网页，它只是让开发者用 React 的方式去描述原生界面。

## 渲染流程

那么接下来就是 React Native 的渲染流程。

React Native 现在把这个过程拆成三个阶段：`Render`、`Commit`、`Mount`。

如果只看这三个词，会觉得它们都很抽象。但如果把它放到一次真实的状态更新里看，事情就清楚很多了。

比如页面上有一个按钮，点击以后计数加一。这个动作发生之后，React 先会知道“状态变了”，然后开始重新计算这个组件树应该长成什么样。这个时候还没有真正去改屏幕上的内容，先改的是内部结构。

React Native 做的，就是把这次变化从 JavaScript 侧一路传到原生侧。它不是一下子把整块界面重画一遍，而是先把新的结构算出来，再把需要更新的部分提交出去，最后挂到原生视图上。

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <View>
      <Text>{count}</Text>
      <Button title="add" onPress={() => setCount(count + 1)} />
    </View>
  )
}
```

当 `count` 变化以后，React 会重新计算这段 JSX 对应的 React Element Tree。  
React Native 再把这个新树和上一次的树比较，找出需要更新的地方。最后它把这些变化翻译成原生层能执行的最小变更。

这个过程里，真正重要的不是“重新画一遍”，而是“只更新发生变化的那部分”。

### Render

首先是 Render。

这一步发生在 JavaScript 侧。React 先根据组件和状态变化，生成一棵 React Element Tree。在新架构里，这棵树还会对应到 C++ 层的 Shadow Tree。

这个阶段做的是结构计算。页面里有哪些组件，它们之间怎么嵌套，属性是什么，状态更新以后应该生成什么样的新树，这些事情都在这个阶段处理。

如果页面里有多个组件，React 并不会因为某一个地方更新了，就傻乎乎地把整个页面重新拼一遍。它会先根据新的状态，算出新的结构，然后和上一次的结构做比较。这样一来，哪些地方变了，哪些地方没变，就都能被识别出来。

所以 Render 阶段更像是在整理一份新的 UI 草稿。它还没真正碰到屏幕，但已经把接下来要显示什么内容算好了。

这里还可以顺手看一下树的样子。比如下面这个结构：

```jsx
<View>
  <Text>Hello</Text>
</View>
```

React 侧会先得到对应的元素树，C++ 侧再生成 Shadow Tree。Shadow Tree 里保存的是组件层级、样式信息和后续布局所需的数据。它不是最终的屏幕树，但它是后面布局和挂载的基础。

### Commit

然后是 Commit。

当新的树准备好之后，React Native 会把这棵树提交给后续阶段处理，并触发布局计算。这个阶段还没有真正把内容画到屏幕上，但已经把下一次要挂载的内容准备好了。

这里的重点不是“有没有画出来”，而是“这份更新是不是已经准备好交给原生层了”。Commit 发生以后，React Native 会知道这次更新可以进入下一步了，接下来就是把布局结果和视图变化落到原生对象上。

如果把 Render 当成“写草稿”，那 Commit 就是“把草稿交给排版和印刷部门处理”。这一步不负责最后展示，但它决定了接下来的内容能不能顺利落到屏幕上。

Commit 阶段主要做两件事：布局计算和 tree promotion。

布局计算会把每个 Shadow Node 的尺寸和位置算出来。React Native 这里使用的是 Yoga。Yoga 处理的是一棵 layout tree，开发者在样式里写的 `flex`、`width`、`height`、`padding`、`margin` 等信息，都会被送进这套布局系统里。

例如：

```tsx
<View style={{ flex: 1 }}>
  <View style={{ height: 100 }} />
  <View style={{ flex: 1 }} />
</View>
```

这段代码里，外层容器先拿到整块可用空间，内部两个子节点再按照各自的约束分配位置和大小。这个过程不是浏览器的 CSS 布局引擎在做，而是 Yoga 在做。

布局结果算出来以后，新的 Shadow Tree 会被提升为 next tree，等待 Mount 阶段被真正挂载。

### Mount

最后是 Mount。

这一步会把已经计算好的结果真正挂到原生视图上。到了这里，iOS 或 Android 才会把界面显示到屏幕上。

Mount 阶段做的事情，已经很接近“把页面真正摆出来”了。原生视图被创建、更新、插入、删除，最后形成用户在手机上看到的那一帧界面。前面所有的计算，到了这里才真正变成了肉眼可见的内容。

也就是说，从开发者写代码，到用户看到界面，中间并不是直接“渲染一下”就结束了，而是经历了结构生成、提交、布局、挂载这一整套过程。

这套过程看起来繁琐，但它做的事情其实很明确：先把 UI 的结构算清楚，再把结构交给布局系统，最后把结果落到平台自己的原生视图上。

Mount 阶段还会做 tree diffing。React Native 会把“上一次已经挂载的树”和“这一次准备挂载的新树”做比较，然后计算出一组原子级别的 mutation，例如 `createView`、`updateView`、`removeView` 之类的操作。

这个 diff 过程是在 C++ 里完成的。它的目标很直接：不要把整棵树推倒重来，只把真正变化的部分转成原生操作。

```txt
previous tree  ->  diff  ->  mutation list  ->  host views
```

如果一个节点只是改了背景色，React Native 不会把整页重新创建一遍，它只会生成对应的更新操作。  
如果一个节点根本没有变化，diff 之后就不会产生多余的原生指令。

View Flattening 也是 Mount 阶段里很重要的优化。React 的组件树经常会比最终需要显示的原生视图树更深，其中有不少节点只是为了组织布局，并不真正负责显示内容。View Flattening 会把这类节点折叠掉，减少不必要的原生视图创建。

这也是为什么 React Native 的渲染链路里，结构树、布局树和最终的 host view tree 并不是一回事。它们的层级不同，职责也不同。

到这里，React Native 这一侧的流程已经比较完整了，但这些结果还只是“准备好”，真正落到屏幕上，还要看原生平台怎么接住这些更新。

## 这些更新在原生侧是怎么生效的？

如果只停留在 React 树这一侧，很多细节还是不够完整。真正把东西画到屏幕上的，还是原生平台自己的视图系统。

在 React Native 里，最基础的几个组件都对应着平台自己的原生控件。

- `View` 会对应到 iOS 的 `UIView`，在 Android 上通常对应 `View` 或 `ViewGroup`
- `Text` 由平台的原生文本渲染系统处理
- `TextInput` 会接到平台原生输入控件
- `Image` 会走平台自己的图片解码、缓存和绘制链路

所以当你写下面这种代码的时候：

```tsx
<View style={{ padding: 12, backgroundColor: '#fff' }}>
  <Text>Hello</Text>
  <TextInput placeholder="type here" />
</View>
```

React Native 并不是把这段 JSX 变成某个中间页面对象，而是把它拆成一组原生视图操作：

- 创建一个容器视图
- 给容器设置 padding 和背景色
- 创建文本节点并交给原生文本渲染
- 创建输入框并连接键盘、焦点和输入事件

这就是 React Native 最核心的一点：JS 层写的是声明式 UI，真正执行的是原生视图系统。

### 原生视图管理

在原生侧，每个平台都有自己的视图管理方式。

Android 上，常见的是通过 `ViewManager` 或 `SimpleViewManager` 来创建和管理原生视图。这个管理器负责把 React 传来的 props 更新到原生控件上，也负责把原生事件再发回 JavaScript。

iOS 上则会通过 `UIView`、`UIViewController`、属性 setter、事件回调这些方式完成同样的工作。React Native 最终要做的事情，就是把 JavaScript 侧的属性更新，映射成平台侧的对象状态变化。

例如一个自定义图片组件，原生侧一般会做这些事：

1. 创建一个原生图片视图
2. 接收 `source`、`resizeMode`、`tintColor` 之类的属性
3. 在属性变化时更新原生控件
4. 在点击、加载完成、失败等节点上向 JS 发事件

这样一来，JS 侧的一个 `<Image />` 组件，就真正和平台图片视图接上了。

Android 侧的代码通常会长得像这样：

```kotlin
class MyBoxViewManager : SimpleViewManager<View>() {
  override fun getName() = "MyBox"

  override fun createViewInstance(context: ThemedReactContext): View {
    return View(context)
  }

  @ReactProp(name = "color")
  fun setColor(view: View, color: Int) {
    view.setBackgroundColor(color)
  }
}
```

这个例子很简单，但结构已经很完整了：创建视图、接收属性、更新原生对象。  
React 侧传来的 props，就是这样一点一点落到原生控件上的。

iOS 侧也类似，通常会创建一个 `UIView` 子类，然后通过属性更新方法把 JS 侧的值写进去，再把需要的事件回传给 JS。

### 事件是怎么回来的

原生侧不只是接收更新，还会主动把事件发回来。

比如点击、滑动、滚动、输入变化、布局完成，这些事情很多都先发生在原生侧，然后再回到 JavaScript 侧处理。常见的事件包括：

- `onPress`
- `onScroll`
- `onChangeText`
- `onLayout`

其中 `onLayout` 很值得提一下。它不是简单的“组件加载完成”，而是原生布局结果已经算出来以后回传给 JS。很多依赖尺寸的逻辑，比如弹层定位、动态高度列表、测量元素位置，都会用到这个事件。

如果需要主动测量一个视图，React Native 也提供了 ref 相关能力。开发者拿到一个原生组件引用以后，可以读取它的边界信息，或者在老接口里调用 `measure`。这类能力通常会用在手势定位、弹窗锚点、滚动吸顶这些场景里。

### 原生模块

除了视图，React Native 还有原生模块。

原生模块解决的是另一类问题：有些功能本来就应该交给平台原生 API 去做，比如相机、通知、定位、文件系统、加密、数据库、传感器这些东西。

如果写纯 JS，这些能力要么做不到，要么性能不够好，要么对系统集成不完整。原生模块允许 JavaScript 直接调用原生代码，让这些能力以模块的方式暴露出来。

例如一个相机模块，JS 侧可能只是调用 `openCamera()`，真正执行的是 iOS 的 `AVFoundation` 或 Android 的相机 API。React Native 只负责把调用路由到正确的平台代码上。

Expo 也提供了自己的原生模块体系。Expo Modules API 允许你用 Swift 和 Kotlin 写原生能力，然后把它暴露给 JavaScript。这样做的好处是两端写法比较统一，而且和新架构兼容得更好。

例如一个简单的原生视图模块，在 Expo 侧可以直接声明一个原生组件，并定义属性和方法。概念上和 React Native 的 native component 很接近，只是写法更现代一些。

```swift
import ExpoModulesCore

public class CounterModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Counter")

    Function("increment") { (value: Int) in
      return value + 1
    }
  }
}
```

```kotlin
class CounterModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Counter")

    Function("increment") { value: Int ->
      value + 1
    }
  }
}
```

这种模块很适合拿来做简单的原生能力验证。  
如果你以后要把更复杂的原生能力接进来，比如传感器、图片处理、加密算法、系统设置页入口，这种方式都是基础。

讲到这里，原生侧的视图、事件和模块基本都串起来了。再往下看，就能明白为什么 React Native 不能把所有事都塞到一个线程里做。

## 为什么要拆线程

React Native 之所以要把这些过程拆开，一个很重要的原因，就是移动端不能把所有事情都塞到一个线程里做。

React Native 的线程模型里，最关键的是两个线程：

- UI thread，负责真正操作原生视图
- JavaScript thread，负责执行 React 逻辑和更新计算

这样拆开以后，JS 侧的计算不会直接阻塞原生界面，原生视图的更新也不会随便被 JS 打断。对于移动端来说，这一点很重要，因为用户对界面的响应速度要求很高。

如果所有渲染和交互都放在一个线程里，代码稍微复杂一点，界面就很容易卡住。React Native 现在的线程模型，本质上就是为了避免这个问题。

这里还有一个很重要的限制：原生视图只能在 UI thread 上修改。React Native 不能随意跳过这个规则，它必须遵守平台本身的线程约束。

线程拆开以后，问题就从“怎么画”变成了“怎么在不同层之间传递变化”。这也就是旧架构和新架构要解决的事情。

## 旧架构和新架构

然后再看 React Native 的旧架构和新架构。

早期的 React Native 最常提到的是 Bridge。这个阶段里，JavaScript 和原生之间的通信方式更像是消息传递。JS 侧先把操作序列化，再通过桥接发给原生，原生收到以后再执行。

这种方式在最开始能工作，也足够清晰，但它有几个很明显的问题：

- 序列化和反序列化会消耗性能
- JS 和原生之间的通信不够直接
- 某些同步能力做起来比较别扭
- 调度空间有限

所以 React Native 后来开始重构底层架构。新架构里比较核心的几个东西是 Fabric、JSI、TurboModules 和新的事件循环。

这些改动带来的变化很直接。原来的桥接方式更偏向异步消息传递，新架构则更强调 JS、C++ 和原生之间的直接协作。这样做之后，渲染链路更短，更新调度更灵活，也更容易支持现代 React 的能力。

这也是为什么现在再看 React Native 的渲染原理，不能只盯着 Bridge 看。Bridge 只是它曾经的一种实现方式，不是现在全部的样子。

讲完底层渲染和通信方式以后，Expo 的位置也就更清楚了。它不是渲染引擎，但它决定了你怎么把这些原生能力接进项目里。

## Expo 在这里负责什么

说到 Expo，很多人第一反应会觉得它是不是也参与了渲染。

其实不是。Expo 不负责把 UI 画到屏幕上，这件事还是 React Native 自己做。Expo 主要负责的是开发流程和工程管理。

它管的事情包括：

- 项目怎么初始化
- 原生工程怎么生成
- 原生模块怎么自动链接
- 开发时怎么快速预览
- 真机和模拟器怎么运行

### Expo Go

先说 Expo Go。

Expo Go 可以看成一个现成的原生容器。开发者把 JavaScript bundle 连上去，就能很快看到项目效果。它很适合快速验证，但它的原生能力是固定的，不能随便加入新的原生库。

所以 Expo Go 更适合做早期开发和验证。它把启动成本压得很低，但也限制了你能改动的范围。

### Development Build

如果项目需要更完整的原生能力，就需要用 development build。

这时候得到的不是公共容器，而是属于自己的 Expo 客户端。它可以包含自定义的原生配置、原生模块和更完整的开发能力。

这个阶段很重要，因为一旦项目开始依赖更多原生能力，Expo Go 就不够用了，development build 才是更接近真实产品的开发方式。

### Prebuild

Expo 的 prebuild 会根据配置生成 `android/` 和 `ios/` 目录。

这说明 Expo 并不是在绕开原生工程，而是在把原生工程的生成过程自动化。它降低的是维护成本，不是替代 React Native 的渲染系统。

如果把 React Native 看成渲染引擎，那 Expo 更像是围绕这个引擎的一整套开发工具。

也正因为这样，Expo 的价值不在于改写渲染过程，而在于把原生工程的复杂度提前处理掉。

## 从代码到屏幕

前面把 Render、Commit、Mount、原生侧和线程模型都拆开看过一遍以后，再把它们合起来，链路就很清楚了。

如果把整个链路串起来，大概可以写成这样：

```text
JSX
  -> React Element Tree
  -> Shadow Tree
  -> Layout Calculation
  -> Mount to Native Views
  -> Screen
```

更直接一点说就是：

开发者先写出界面结构，React 负责生成组件树，React Native 负责把这棵树交给布局系统和原生平台，最后由 iOS 或 Android 把结果真正显示出来。

所以 React Native 的目标不是做一个跨平台网页框架，而是让开发者用 React 的方式去驱动移动端原生 UI。

把前面的内容收回来，其实整个链路就是这件事：前端写结构，React 算树，原生平台负责把结果画出来。

这也正好把前面的所有概念扣在了一起。React Native 负责的是渲染，Expo 负责的是把这套渲染流程放进更好用的开发环境里。

## React Native 和 Expo 的关系

最后再说一下 React Native 和 Expo 的关系。

这两个东西本来就不在同一层。

React Native 解决的是 UI 怎么渲染到原生平台上，Expo 解决的是开发者怎么更轻松地把项目跑起来、构建起来、维护起来。

把它们放在一起看，最容易混淆的地方其实也就在这里：一个管界面怎么落到屏幕上，一个管项目怎么落到设备上。

它们不是竞争关系，也不是替代关系，而是上下游关系：

- React Native 决定渲染机制
- Expo 决定开发体验

所以你用 Expo 开发 React Native 应用的时候，底层依然还是 React Native 的渲染逻辑在工作，只是 Expo 帮你把很多原生工程的细节收掉了。

把这两个东西放在一起看，就不会再把它们当成同一层的概念了。

## 总结

如果把前面的内容按顺序排一下，大概就是这样：

- React 先生成 UI 结构
- React Native 把结构交给布局、diff 和原生挂载
- 原生平台负责把最终结果显示出来
- Expo 负责把整个开发和构建流程管理好

如果把这件事压缩成一句话，我会这么说：

React Native 负责把 React 的声明式 UI 变成原生视图，Expo 负责把这条链路包装成更省心的开发流程。

理解了这一点之后，再去看 Expo Go、development build、prebuild、Fabric、JSI 这些名词，脑子里就不会乱了。它们不是一堆孤立的术语，而是同一条链路上的不同节点。

前面这一套如果能说明白，后面再看别的跨端框架或者原生能力接入，思路基本也就通了。

这里再给下次分享挖个坑吧，下次分享大家更想了解 React 渲染网页的原理呢？还是其他 移动端 / 跨端 技术呢？还是更想了解一些后端相关知识呢？

## 参考链接

- [React Native Render, Commit, and Mount](https://reactnative.dev/architecture/render-pipeline)
- [React Native Threading Model](https://reactnative.dev/architecture/threading-model)
- [React Native Fabric](https://reactnative.dev/architecture/fabric-renderer)
- [React Native New Architecture is here](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here)
- [Expo development builds introduction](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo use a development build](https://docs.expo.dev/develop/development-builds/use-development-builds/)
- [Expo Continuous Native Generation](https://docs.expo.dev/workflow/prebuild)
- [Expo React Native's New Architecture](https://docs.expo.dev/guides/new-architecture/)
