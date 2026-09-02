---
date: 2025-02-07 16:20:09
updated: 2026-09-02 14:47:18
category: Development
tags:
  - FrontEnd
  - Study
title: React 组件封装
description: 从基础 Props 抽象、副作用隔离到 AntD 与 shadcn/ui 的架构选型思考
---

# React 项目中的组件封装

写 React 代码时，我们几乎每天都在新建 `.tsx` 文件并导出一个个函数。但“把一段 JSX 抽出来”和“做好一次组件封装”是两码事。

封装的本质是**划定责任边界**：隐藏内部不需要外部关心的状态与实现细节，只暴露清晰、稳定的接口（Props 与事件回调）。好的封装能让业务页面像搭积木一样清晰；而过度或不当的封装，往往会把简单的逻辑缠成无法维护的面条代码。

---

## 1. 基础抽象：从纯渲染到局部交互

最基础的封装往往遵循纯函数逻辑：输入确定的 Props，输出预期的 UI。

```tsx
interface GreetProps {
  name: string
}

export const Greet = ({ name }: GreetProps) => {
  return <div>Hello, {name}</div>
}
```

当组件需要响应用户行为时，可以通过定义明确的事件接口与内部状态来承载交互：

```tsx
interface CounterProps {
  initialCount?: number
  onChange?: (count: number) => void
}

export const Counter = ({ initialCount = 0, onChange }: CounterProps) => {
  const [count, setCount] = useState(initialCount)

  const handleIncrement = () => {
    const nextCount = count + 1
    setCount(nextCount)
    onChange?.(nextCount)
  }

  return (
    <div className="counter-box">
      <span>当前计数：{count}</span>
      <button onClick={handleIncrement}>+1</button>
    </div>
  )
}
```

这里封装的关键在于：外部调用方只需要关心 `initialCount` 和 `onChange`，而不需要介入 `setCount` 的具体流转细节。

---

## 2. 逻辑分层：副作用与状态透传

业务组件不可能永远只是静态展示。数据获取、事件监听、跨层级状态共享往往是复杂度的主要来源。

### 副作用隔离

React 的函数组件在每次状态更新时都会重新执行函数体。因此，数据请求这类异步操作不能直接写在组件主体中，否则不仅会造成状态死循环，还会违背渲染函数的纯度要求。

通常我们用 `useEffect` 或封装自定义 Hook 来收敛这部分逻辑：

```tsx
interface User {
  id: string
  name: string
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let ignore = false

    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!ignore) setUsers(data)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  if (loading) return <div>加载中...</div>
  if (error) return <div>请求失败：{error.message}</div>
  if (users.length === 0) return <div>暂无数据</div>

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

在实际项目中，更推崇的做法是将 `useEffect` 内的数据获取收敛为 `useUsers` 等自定义 Hook，使 UI 组件只负责消费状态，彻底与底层 I/O 细节解耦。

---

### 跨层级状态透传（Context API）

当某个状态（如主题切换、全局布局折叠状态）需要被深层嵌套的子组件读取时，逐层透传 Props（Prop Drilling）会严重污染中间组件的接口。

标准做法是结合 Context 与自定义 Hook，并在 Hook 内部做好越界校验：

```tsx
import { createContext, useContext, useState, ReactNode } from "react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebar 必须在 SidebarProvider 内部使用")
  }
  return ctx
}
```

在消费侧，子组件直接通过 `useSidebar` 获取上下文：

```tsx
const SidebarTrigger = () => {
  const { toggle } = useSidebar()
  return <button onClick={toggle}>切换侧边栏</button>
}

const SidebarView = () => {
  const { isOpen } = useSidebar()
  return (
    <aside className={isOpen ? "w-64 block" : "hidden"}>
      <nav>侧边栏内容</nav>
    </aside>
  )
}

// 组合使用
export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="layout-container">
        <SidebarTrigger />
        <SidebarView />
      </div>
    </SidebarProvider>
  )
}
```

---

## 3. 样式与架构范式：Token 体系 vs Headless

除了逻辑拆分，组件库在样式层面的架构选择直接决定了后期的二次定制成本与维护体验。目前业界最具代表性的两种流派是 **Ant Design** 与 **shadcn/ui**。

### Ant Design：中心化 Design Token

Ant Design（v5+）基于 CSS-in-JS 与 Design Token 理念构建。它通过将颜色、圆角、间距等样式抽象为种子变量（Seed Tokens）与派生变量，由顶层 `ConfigProvider` 统一计算并下发：

```tsx
import { Button, ConfigProvider, Space } from "antd"

export const ThemedApp = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#00b96b",
        borderRadius: 4,
      },
    }}
  >
    <Space>
      <Button type="primary">主题主按钮</Button>
      <Button>默认按钮</Button>
    </Space>
  </ConfigProvider>
)
```

- **适用场景**：中后台管理系统、注重开箱即用与跨团队统一视觉规范的场景。
- **权衡**：AntD 封装程度极高，开发者几乎不需要手写基础 CSS；但如果业务需要做重度视觉重塑或定制非标动画，需要层层覆写内部组件结构与 Token，定制成本陡增。

---

### shadcn/ui：Headless 基础 + 源码掌控

与传统打包发布的 npm 单体库不同，shadcn/ui 本质上是一个**组件代码合集**。它的底层依赖 Radix UI 处理无障碍（WAI-ARIA）与交互逻辑，样式则完全通过 Tailwind CSS 编写。

通过命令行将组件源码直接注入项目目录：

```bash
npx shadcn@latest add tabs
```

生成的代码直接落在项目本身的 `components/ui/tabs.tsx` 中。调用方式采用子组件组合模式（Compound Components）：

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const SettingsTabs = () => (
  <Tabs defaultValue="account" className="w-full">
    <TabsList>
      <TabsTrigger value="account">账号设置</TabsTrigger>
      <TabsTrigger value="password">安全密码</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <div className="p-4">修改个人资料与邮箱...</div>
    </TabsContent>
    <TabsContent value="password">
      <div className="p-4">重置密码与双重认证...</div>
    </TabsContent>
  </Tabs>
)
```

- **架构优势**：
  1. **零黑盒**：代码就在你的仓库里，想要改 DOM 结构、换动画类名或加自定义 Props，直接改源码即可，不存在“等官方发版修复”的问题。
  2. **按需引入**：不引入庞大的全局 Runtime，打包体积只受实际引用的组件与 Tailwind 样式影响。
  3. **交互与视觉解耦**：底层 Radix 处理键盘导航、Focus 焦点捕获与屏幕阅读器无障碍，上层自由定制视觉。
- **权衡与代价**：
  源码进入业务工程后，维护责任就转移到了业务团队自己身上。上游 Bug 修复或重大重构无法通过一次 `npm update` 自动解决，需要开发者对组件源码具备足够的理解与维护能力。

---

## 总结思考

组件封装没有放之四海皆准的标准，关键在于根据业务生命周期做出权衡：

- **基础页面与快速交付**：选择 Ant Design 这类开箱即用的高阶组件库，以约定换取交付效率。
- **重品牌定制与复杂交互产品**：采用 Radix / Headless + Tailwind（如 shadcn/ui）方案，将行为基础与视觉表现彻底解耦，在长期迭代中换取最大自由度。
