# 代码块

代码高亮、diff 使用 VitePress 内置能力。折叠按代码块显式开启，不会自动折叠旧文章。

## 展示前 N 行，可展开/收起

````md
```ts :collapsed-lines=10
// 超过指定行数时折叠，点击按钮展开或收起
```
````

`:collapsed-lines` 不指定数值时默认展示 15 行。

折叠使用 `vitepress-plugin-code-collapse` 0.12.2，当前版本支持 VitePress 2；
升级时需检查 peerDependencies 与 VitePress alpha 版本的兼容性。

## 最大高度与滚动

````md
```ts :height=320px
// 最大高度 320px，超出后内部滚动，短代码不会被撑高
```

```ts{2,5-8} :height=24rem
// 可与行高亮、:line-numbers 配合
```
````

高度支持正数 `px`、`rem`、`vh`，例如 `320px`、`24rem`、`50vh`。
无需花括号；非法高度会报错，避免悄悄失效或注入任意 CSS。

可组合 `:collapsed-lines=10 :height=320px`：
折叠时展示预览，展开后仍保留最大高度，收起时重置垂直滚动位置。
Mermaid / mmd 图表不应用这些增强。

## 行高亮

````md
```ts{2,4-6}
// 指定高亮行号或范围
```

```ts
const important = true // [!code highlight]
```
````

## diff

````md
```ts
const timeout = 1000 // [!code --]
const timeout = 3000 // [!code ++]
```
````

这是增删行标记，不会自动计算两段代码的差异。

## 完整收起

````md
::: details 查看完整代码
```ts
const example = true
```
:::
````
