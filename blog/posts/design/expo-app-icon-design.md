---
date: 2025-02-07 16:20:09
updated: 2025-06-26 09:01:04
category: Design
tags:
  - FrontEnd
  - Mobile
title: 移动应用图标设计
description: 设计和配置 Splash Screen 与 App Icon
---

# **使用 Expo 构建 Android 和 iOS 应用时设计和配置 Splash Screen 与 App Icon**

前段时间在推动「**华师匣子**」完全重构后的 3.0 版本的上线，应用上线当然离不开一个好看的门头，于是着手配置匣子的 **启动画面（Splash Screen）** 与 **应用图标（App Icon）**。起初以为只需准备一张图交给 Expo 配置即可，但真正深入研究时，才发现 iOS 和 Android 在图标与启动页方面的设计理念与规范差异不小。

---

## **一、平台差异与设计理念对比**

在设计 Splash Screen 与 App Icon 之前，了解 Google 与 Apple 的设计哲学非常重要，它们的出发点不同，最终呈现方式也有所区别：

| **项目**      | **Apple（iOS）理念**                                               | **Google（Android）理念**                                            |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| App Icon      | 强调极简和一致性。图标不带圆角，由系统统一加遮罩，保持系统风格。   | 强调灵活性。支持自定义前景与背景，系统应用多种遮罩（圆形、泪滴等）。 |
| Splash Screen | 作为功能性过渡界面，不允许动画或延时，仅允许展示静态图像与背景色。 | 支持动画启动（Android 12 起），但强调流畅体验，建议简洁过渡。        |


![Apple App Icon Example](https://docs-assets.developer.apple.com/published/298204fa29c2dc771deb8651963ce75a/app-icons-platform-appearance-overview%402x.png)

![Android App Icon Example](https://image.baidu.com/search/down?url=https://tvax4.sinaimg.cn/large/007CWdRmly1i2rt4fxfesj31a20u81as.jpg)

---

## **二、App Icon 设计指南**

### **iOS 平台**

根据 [Apple 官方 HIG](https://developer.apple.com/design/human-interface-guidelines/app-icons/)：

- 必须为正方形图标（1024×1024 px）。
- **不要添加圆角**，系统会自动处理。
- 图标应具有识别度，避免文字或复杂元素。
- 背景必须不透明（纯白或品牌色），不要留空或透明区域。    

![iOS App Icon Design Template](https://static.uxbaike.com/uploads/2024/01/d2b5ca33bd970f64a6301fa75ae2eb22-307.png)

---
### **Android 平台**

参考 [Android Adaptive Icon 设计规范](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive?hl=zh-cn)：

- 图标分为前景图和背景色或图。
- 系统应用不同遮罩形状显示图标（圆形、泪滴、方形等）。
- 前景图像应居中，避免边缘贴边（保持安全区）。

![](https://image.baidu.com/search/down?url=https://tvax4.sinaimg.cn/large/007CWdRmly1i2rtfs2ymfj318g18gdmo.jpg)

---

### **推荐工具：**

- 📠 [官方图标制作工具](https://developer.android.com/studio/write/create-app-icons?hl=zh-cn)：轻松创建用于 Android 的图标
- 🎨 [Figma 图标设计模板](https://www.figma.com/community/file/1466490409418563617)：已适配 iOS 与 Android 尺寸
- 🛠️ [expo-optimize](https://docs.expo.dev/expo-cli/command-reference/optimize/)：用于图像压缩优化

---

## **三、Splash Screen 设计建议**

Splash Screen 是用户点击图标后的第一屏，其作用是承接启动过程、展现品牌感。

### **通用设计建议：**

- 使用品牌图标或标志性元素，简洁为主。    
- 图像居中显示，背景色与品牌主色调一致。
- 避免文字或加载动画，保持统一视觉体验。

### **iOS 注意事项**

Apple 不允许控制 Splash 停留时间，不允许加入动画。开发者需通过配置 LaunchScreen.storyboard 实现固定启动页。

![](https://www.applin.dev/docs/ios/launch_screen.storyboard.png)
### **Android 支持动画启动（12+），但建议尽量保持风格一致，不使用复杂动效。**

<video alt="显示 Google Gmail 应用启动画面的视频" controls="" src="https://developer.android.com/static/images/guide/topics/ui/splash-screen/splash-screen-gmail-example.mp4?hl=zh-cn" width="40%"></video>

---

## **四、Expo 中的配置方式**

Expo 提供了集中化的配置方式，统一管理图标和启动页资源。只需编辑 app.json 或 app.config.js。

### **App Icon 配置示例**

```
{
  "expo": {
    "icon": "./assets/icon.png"
  }
}
```

> 推荐尺寸：1024×1024 px   
> 不添加圆角、不透明背景  

对于 Android 自定义 Adaptive Icon：

```
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

---

### **Splash Screen 配置示例**

```
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

字段说明：

- image: 建议透明 PNG 格式的 logo。
- resizeMode:
    - contain: 居中缩放，不裁剪。
    - cover: 全屏填充，可能裁剪边缘。
- backgroundColor: 建议与主 UI 保持一致。

---

## **五、调试建议**

- 使用 npx expo start 快速预览配置效果。
- 使用 expo run:android / expo run:ios 构建真机测试。 
- 若 iOS 上启动页不显示，可参考 Apple 的 [TN3118 技术文档](https://developer.apple.com/documentation/technotes/tn3118-debugging-your-apps-launch-screen)。

---

## **六、尺寸汇总表**

| **项目**           | **推荐尺寸** | **文件格式** | **注意事项**             |
| ------------------ | ------------ | ------------ | ------------------------ |
| App Icon           | 1024×1024 px | PNG          | 不透明背景，无圆角       |
| Adaptive Icon 前景 | 432×432 px   | PNG          | 居中留边距，避免贴边裁剪 |
| Splash Image       | 1242×2436 px | PNG          | 中心图像，背景色匹配 UI  |

---

## **七、总结**

设计图标和启动页看似细节，但却直接影响用户的第一印象。如果你正在使用 Expo 开发 App，建议在早期就将这些资源准备好，确保在 Android 与 iOS 上都有一致且合规的体验。

> 参考链接
> - [苹果官方指南](https://developer.apple.com/design/human-interface-guidelines/app-icons/)
> - [安卓官方指南](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive?hl=zh-cn)
> - [UI 百科](https://www.uxbaike.com/post/401/2385)
> - [少数派](https://sspai.com/post/40223)
> - [尺寸参考](https://pixso.cn/designskills/tubiaochicunguifan/)

