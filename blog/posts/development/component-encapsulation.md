---
date: 2025-02-07 16:20:09
updated: 2025-05-09 09:49:57
category: Development
tags:
  - FrontEnd
title: React 组件封装
description: 简要介绍一下 React 中的组件封装
---


# React 项目中的组件封装
在前端开发中，组件封装指的是将 UI 的一部分（例如一个按钮、一个表单、一个对话框等）及其相关的逻辑（例如数据获取、事件处理、状态管理等）组合成一个独立的、可复用的单元，这个单元就称为组件。

组件封装的目标是提高代码的可复用性、可维护性和可测试性。通过将 UI 和逻辑封装到组件中，我们可以：

- **提高代码复用性:** 将常用的 UI 元素封装成组件，可以在不同的页面或项目中重复使用，避免重复编写相同的代码。
- **提高代码可维护性:** 当需要修改 UI 或逻辑时，只需要修改组件的代码，而不需要修改多个地方的代码。
- **提高代码可测试性:** 组件可以独立进行测试，更容易发现和修复 bug。
- **提升开发效率:** 使用组件可以加快开发速度，因为开发者可以直接使用现成的组件，而不需要从头开始编写代码。
- **增强代码组织结构:** 将代码拆分成更小、更易于管理的单元，使代码更具可读性和可理解性。

组件封装的核心思想:

- **封装性:** 组件内部的实现细节对外隐藏，只暴露必要的接口供外部使用。
- **可复用性:** 组件可以在不同的场景下重复使用。
- **可组合性:** 组件可以像积木一样组合成更复杂的 UI。

## 基础的组件封装
以 React 中最常用的 *函数式组件* 为例，一个最简单的组件封装如下：

```tsx
const Greet = (name: string) => {
  return <div>Hello {name} </div>
}

// using the functional component
<Greet name="Alice"/>
<Greet name="Bob"/>
```

通过更改传入组件的 `props` 值，我们就可以复用这个封装好的组件。当然，有时组件不仅仅用于数据渲染，也用于与用户交互：

```tsx
interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

```

组件也可以拥有自己的 `state`，以实现响应式的数据渲染与操作：

```tsx
const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>你点击了按钮 {count} 次</p>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>
        点击我
      </button>
    </div>
  )
}

```

看到这里，恭喜你已经入门了 React 的组件封装。但实际开发中，组件承担的功能往往更加复杂，想要真正优雅地封装出好的组件水是很深的。


## 更进一步
在实际的业务中，前端的数据大部分要从后端获取，而这个过程中常常涉及异步操作。在一个组件中进行异步操作，一般需要依靠 `useEffect` 钩子：

```tsx
const AsyncComponentPromise = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((jsonData) => setData(jsonData))
      .catch((error) => setError(error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error：{error.message}</div>
  }

  if (data) {
    return (
      <div>
        <h1>Loaded</h1>
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    )
  }

  return <div>No Data</div>
}

```

我们为什么需要 `useEffect` 钩子来进行异步操作呢？答案很简单，React 作为一个 UI 框架，其核心在于渲染出页面，所以整个函数式组件的函数体，实际上是构建、渲染这个组件的流程，一旦我们在渲染流程中直接进行异步操作，就会导致这个流程需要等待异步操作结束，即阻塞了组件的渲染。

而 `useEffect` 钩子为了解决这个问题，其接收的函数将会在组件渲染完成后执行，这样就避免了异步操作对组件渲染的阻塞。

实际上应该放在 `useEffect` 钩子中执行的不仅仅是异步操作，还有例如修改特殊变量、进行 I/O 操作、抛出异常等代码，这些有一个统称叫做 *副作用*，这里不展开讲解。

另一个非常有用的钩子叫做 `useContext`，它是 React 中 *状态提升* 操作的高级解决方案，可以将状态跨越多层组件透传，一个典型的例子是用它实现侧边栏这种布局状态的控制：

```tsx
import { createContext, useContext, useState } from "react"

const SidebarContext = createContext()

const SidebarProvider = ({ children }) => {
  // 在 Provider 中保存状态，并提供给内部组件访问
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const Sidebar = () => {
  // 获取状态
  const { isSidebarOpen, toggleSidebar } = useSidebar()

  return (
    <aside
      className={`bg-gray-800 text-white w-64 ${
        isSidebarOpen ? "block" : "hidden"
      }`}
    >
      {/* Sidebar content */}
      <button onClick={toggleSidebar}>关闭侧边栏</button>
    </aside>
  )
}

export { SidebarProvider, Sidebar, useSidebar }

```

在使用组件时，要先创建 Sidebar 上下文，再调用 Sidebar 组件：

```tsx
const App = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <main className="p-4">
          {/* Main content */}
          <button onClick={toggleSidebar}>打开侧边栏</button>
        </main>
      </div>
    </SidebarProvider>
  )
}

```

## 组件样式

前端开发另一个重要的部分就是样式的实现了，虽然用来编写样式的 Extension 有很多，但要利用好他们其实也需要一些技巧。例如刚接触前端开发的人最常犯的错误就是 css 选择器运用不熟练，导致出现非常多不同类名但拥有重复的代码。

下面我们来看看几大组件库的样式实现方式。

### Ant Design

AntD 采用的是 Design Token 模式，通过预定义的原子化 Token 来自定义样式：

```tsx
import { Button, ConfigProvider, Space } from "antd"
import React from "react"

const App: React.FC = () => (
  <ConfigProvider
    theme={{
      token: {
        // Seed Token，影响范围大
        colorPrimary: "#00b96b",
        borderRadius: 2,

        // 派生变量，影响范围小
        colorBgContainer: "#f6ffed",
      },
    }}
  >
    <Space>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
    </Space>
  </ConfigProvider>
)

export default App

```

这种模式许多优点：

- **一致性:** 设计令牌确保在整个应用程序中使用相同的颜色、字体、间距等样式。 更改一个令牌的值会自动更新所有使用该令牌的地方，从而减少了维护工作量并避免了不一致性。
- **可维护性:** 集中管理设计令牌使得修改样式变得更容易。 开发者只需要修改令牌的值，而不需要在整个代码库中搜索和替换样式。
- **可扩展性:** 设计令牌使得设计系统更容易扩展。 可以轻松添加新的令牌，而不会影响现有代码。
- **可重用性:** 设计令牌可以跨多个项目和平台重用，从而提高了效率。
- **协作性:** 设计令牌为设计师和开发者提供了一种通用的语言，方便他们协作。 设计师可以定义令牌，开发者可以使用这些令牌来构建 UI 组件。
- **主题定制:** 通过修改设计令牌，可以轻松地创建不同的主题，例如深色模式或品牌主题。

但同时也有许多缺陷：

- **学习成本:** 需要学习如何使用设计令牌系统，这对于团队成员来说可能需要一些时间和精力。
- **初始设置成本:** 设置设计令牌系统需要一些前期工作，例如定义令牌、创建工具等。
- **复杂性:** 对于小型项目，设计令牌系统可能显得过于复杂，得不偿失。 管理大量的令牌也可能变得复杂。
- **工具依赖:** 通常需要使用一些工具来管理和使用设计令牌，例如 Style Dictionary 或类似的工具。 这增加了项目的依赖性。
- **潜在的命名冲突:** 如果令牌命名不当，可能会导致命名冲突。 需要制定一个清晰的命名约定来避免这种情况。
- **调试难度:** 追踪样式问题可能变得更困难，因为需要追踪令牌的层层映射关系。

### shadcn/ui

shadcn/ui 与 AntD 差别十分明显，其采用 Headless UI 理念构建：

Headless UI 是一种新型的 UI 组件开发模式，它只关心行为逻辑，不涉及 UI 的具体实现，从而允许开发者自由定制 UI，这种设计思想符合开闭原则。

目前比较出众的是 Radix、headlessui，主要都是解决 Behavior Libraries 层面的问题。旨在提供一套开放、无控制、无样式的基础组件，方便开发者进行进一步的个性化封装。我的探索之旅中，我读过、试过这两者，最终决定更深入地使用 Radix，主要是因为 [shadcn/ui](https://github.com/shadcn-ui/ui) 这个优秀项目也是建立在 Radix 的基础上！以下是 Radix 的几大核心理念：

- 可访问性（Accessible）：如果你需要考虑应用的可访问性（残疾人士友好），Radix 的设计遵循 **`WAI-ARIA`** 规范，这是 W3C 编写的规范，定义了一组可用于其他元素的 HTML 特性，用于提供额外的语义化以及改善无障碍体验。
- 无样式（Unstyled）：正如其名，Radix 提供的组件不包含任何预设风格，完全自由地配合任何样式方案，这也直击了自定义样式的痛点。
- 开放性（Opened）：Radix 的开放性极佳，每一个组件都是独立的单元，可自由组合、灵活配置，满足你的各种需求。

shadcn/ui 是 Vercel 的工程师推出的一款组件合集，建立在 Tailwind CSS 和 Radix UI 之上，目前包括了48个独立组件。根据[官方说明](https://ui.shadcn.com/docs)，这款产品被定义为「组件合集」而非传统的「组件库」，其独到之处在于：不通过 npm 安装，而是直接将组件源代码复制粘贴到项目中，这样极大地方便了用户根据自己的需求去修改和扩展代码。

与传统组件库相比，shadcn/ui 遵循以下设计原则：

- **避免不必要的依赖**：不把整个库作为依赖项添加，有助于减少项目体积，从而提升应用的加载速度。
- **组件代码的直接编辑**：由于使用复制和粘贴的方式加入项目，提供了直接访问每个组件源代码的能力，开发者可以直接访问和控制每个组件的行为、样式和 DOM 结构，这种灵活性让 shadcn/ui 在众多 UI 解决方案中脱颖而出。
- **细粒度的控制**：每一个组件都是独立的单元，可以单独使用和定制，这种模块化的设计不仅简化了个别组件的定制过程，也便于整体 UI 系统的扩展和维护。
- **多层次的样式自定义**：首先，shadcn/ui 提供了图形界面的主题编辑器，允许开发者在不直接修改 CSS 的情况下，通过编辑器定制一系列样式（如颜色、字体、边距等）；其次，开发者还可以在组件源代码层面进行个性化调整，或在使用组件时直接在标签上添加 className；最后，通过 RenderProps 方式进一步扩展 UI，开发者可以拿到当前上下文的状态，天然适合对 UI 的自定义扩展。这种多维度的自定义能力极大增强了 UI 的灵活性和适应性。

例如，使用 shadcn/ui 中的 Tabs 组件时，可以通过以下命令简单地添加到项目中：

```html
<Tabs defaultValue="account" className="w-full">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">在这里修改你的账号设置</TabsContent>
  <TabsContent value="password">在这里修改你的密码</TabsContent>
</Tabs>
```

执行 **`npx shadcn-ui@latest add tabs`** 后，Tabs 组件会被安装到 **`./components/ui/tabs.tsx`**，此时开发者可以直接编辑源代码以定制 Tabs 组件。Tabs 组件自身被设计为多个可单独定制的子组件（如 Tabs, TabsContent, TabsList, TabsTrigger），这为定制和风格化提供了极大的便利。

shadcn/ui 的设计理念是将交互逻辑的复杂性留给组件维护者，而将 UI 的定制性最大化地交给使用者，实现了业务需求的高度定制化。这种做法符合软件设计原则「关注点分离」（Separation of concerns，SoC），不过也带来了一些挑战：

- **对开发者的要求较高**：需要良好的抽象设计能力来处理无UI层的组件。
- **较高的使用成本&升级成本**：完全自定义的 UI 层可能带来更大的开发成本，未来的更新升级也比较麻烦，需要仔细评估成本和收益。