---
date: 2025-04-06 00:44:14
updated: 2025-06-26 09:01:36
title: Lottie 在 Web 开发中的应用
description: 稍微调研了一些 Lottie Web 库，这里记录一下
tags:
  - FrontEnd
category: 前端开发
---

# Lottie 在 Web 开发中的应用

[Lottie](https://airbnb.design/lottie/) 是由 Airbnb 开源的一套跨平台动画解决方案。它极大地简化了设计师和开发者之间的协作流程 - 设计师可以在 After Effects (AE) 或 Figma 等设计软件中创建动画，导出为 JSON 格式后，开发者便可以在各个平台上实现一致的动画效果。

作为前端开发者，Lottie 的出现显著降低了实现复杂动画的门槛。无需手写复杂的 CSS 动画或 Canvas 绘制代码，通过简单的配置就能完美还原设计稿中的动画效果。

## 设计工作流

### Figma 工作流
1. 安装 [LottieFiles for Figma](https://www.figma.com/community/plugin/809860933081065308/lottiefiles) 插件
2. 使用 Figma 创建动画
3. 通过插件导出为 JSON 格式

### After Effects 工作流
1. 安装 [LottieFiles for After Effects](https://lottiefiles.com/plugins/after-effects) 插件
2. 使用 AE 制作动画
3. 通过插件导出为 JSON 格式

## Web 端实现方案对比

在前端开发中，主要有三种实现方案：

### 1. Lottie Web (官方 SDK)

- **优点**：
  - 官方维护，更新及时
  - 性能优化，直接使用 Canvas/SVG 渲染
  - 提供完整的动画控制 API
- **缺点**：
  - 需要手动处理与框架的集成
  - API 偏底层，使用相对复杂

### 2. React Lottie

- **优点**：
  - 专为 React 设计的封装
  - API 简单易用
- **缺点**：
  - 基于较早期的 bodymovin.js
  - 使用 Class Components，不完全适配现代 React
  - TypeScript 支持有限

### 3. Lottie React

- **优点**：
  - 基于最新的 Lottie Web
  - 完整的 TypeScript 支持
  - 支持函数组件和 Hooks
  - 提供声明式和命令式两种使用方式
- **推荐使用场景**：
  - 现代 React 项目
  - 需要 TypeScript 支持
  - 简单动画展示需求

## 实战应用

### Lottie Web 使用示例

#### 安装

```bash
# NPM
npm install lottie-web

# 或使用 CDN
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.4/lottie.min.js"></script>
```

#### 基础使用

```html
<div id="lottie-container" style="width: 400px; height: 400px"></div>

<script>
  const animation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg',  // 可选: 'svg' | 'canvas' | 'html'
    loop: true,
    autoplay: true,
    path: 'animation.json'  // 动画文件路径
  });
</script>
```

#### React 集成示例

```tsx
import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import animationData from './animation.json';

const LottieAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem>();

  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });

    return () => animationRef.current?.destroy();
  }, []);

  return <div ref={containerRef} style={{ width: 400, height: 400 }} />;
};

export default LottieAnimation;
```

### Lottie React 使用示例

#### 安装

```bash
npm install lottie-react
# 或
pnpm add lottie-react
```

#### 组件式使用

```tsx
import Lottie from 'lottie-react';
import animationData from './animation.json';

const Animation = () => (
  <Lottie 
    animationData={animationData}
    loop={true}
    autoplay={true}
    style={{ width: 400, height: 400 }}
  />
);

export default Animation;
```

#### Hook 式使用

```tsx
import { useLottie } from 'lottie-react';
import animationData from './animation.json';

const Animation = () => {
  const { View, play, pause, stop } = useLottie({
    animationData,
    loop: true,
    autoplay: false,
  });

  return (
    <div>
      {View}
      <button onClick={() => play()}>播放</button>
      <button onClick={() => pause()}>暂停</button>
      <button onClick={() => stop()}>停止</button>
    </div>
  );
};

export default Animation;
```

### 高级功能

#### 动画控制

```tsx
import { useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import animationData from './animation.json';

const ControlledAnimation = () => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleComplete = () => {
    console.log('动画播放完成');
  };

  return (
    <div>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        onComplete={handleComplete}
      />
      <button onClick={() => lottieRef.current?.setSpeed(2)}>
        2倍速播放
      </button>
      <button onClick={() => lottieRef.current?.goToAndPlay(30, true)}>
        跳转到第30帧并播放
      </button>
    </div>
  );
};

export default ControlledAnimation;
```

## 性能优化建议

1. **选择合适的渲染器**
   - SVG: 适用于小型、交互性强的动画
   - Canvas: 适用于大型、复杂的动画

2. **优化动画资源**
   - 压缩 JSON 文件
   - 移除未使用的关键帧
   - 适当降低动画帧率

3. **按需加载**
   - 使用动态导入延迟加载动画资源
   - 考虑在适当时机销毁动画实例

4. **缓存策略**
   - 对频繁使用的动画进行缓存
   - 考虑使用 Service Worker 缓存动画资源

## 最佳实践

1. **文件管理**
   ```
   src/
   ├── assets/
   │   └── animations/     # 存放动画JSON文件
   ├── components/
   │   └── animations/     # 存放动画组件
   ```

2. **组件封装**
   ```tsx
   // src/components/animations/AnimationWrapper.tsx
   import Lottie, { LottieProps } from 'lottie-react';
   
   interface Props extends Partial<LottieProps> {
     name: string;
     size?: number;
   }
   
   const AnimationWrapper = ({ name, size = 200, ...props }: Props) => (
     <Lottie
       animationData={require(`@/assets/animations/${name}.json`)}
       style={{ width: size, height: size }}
       {...props}
     />
   );
   
   export default AnimationWrapper;
   ```

3. **错误处理**
   ```tsx
   const Animation = () => {
     const handleError = (err: Error) => {
       console.error('Lottie 动画加载失败:', err);
       // 显示后备UI
     };
   
     return (
       <ErrorBoundary fallback={<FallbackUI />}>
         <Lottie
           animationData={animationData}
           onError={handleError}
         />
       </ErrorBoundary>
     );
   };
   ```

Lottie 为 Web 开发带来了设计与开发的无缝衔接，大幅提升了动画开发效率。通过合理选择实现方案、遵循最佳实践，我们可以轻松地在 Web 应用中实现高质量的动画效果。
