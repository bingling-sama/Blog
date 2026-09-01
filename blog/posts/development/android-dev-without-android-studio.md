---
date: 2026-09-01 16:30:00
updated: 2026-09-01 22:24:23
title: 告别臃肿：在 Mac 上完全脱离 Android Studio 配置 Android SDK 与模拟器全指南
description: 记录如何彻底卸载 Android Studio，利用官方全新的 Android CLI 工具链、ARM64 系统镜像与 ADB，从零搭建极简纯净的 Android 开发环境并跑通 Expo。
category: Development
tags:
  - Android
  - Mobile
  - ReactNative
  - Expo
  - Mac
---

# 告别臃肿：在 Mac 上完全脱离 Android Studio 配置 Android SDK 与模拟器全指南

最近在开发 React Native / Expo 跨端项目时，看着 Mac 磁盘里动辄占用十几个 G、每次启动还要吃掉海量内存的 Android Studio，我实在有点忍无可忍了。

对于大多数主用 VS Code / Cursor 写前端或跨端应用的开发者来说，我们平时根本不需要 Android Studio 那个庞大厚重的 GUI 编辑器。我们真正需要的，其实只有三样东西：

- **Android SDK 组件**（Platform、Build-tools 等编译依赖）
- **Android Emulator**（ARM64 架构的高性能本地模拟器）
- **ADB**（用于与模拟器通信和安装调试应用）

今天我和 AI 把这套流程彻底梳理了一遍，直接把 Android Studio 卸了个干干净净，实现了一套**纯终端驱动、开销极小且开箱即用的 Android 开发环境**。

在折腾的过程中，我还发现**网上 95% 以上的无 Android Studio 教程全部都已经过时了**。今天就把这次完整的摸索与避坑过程记录下来，给同样追求轻量化开发环境的同学一个参考。

---

## 命令行工具链的大变天

在开始安装之前，先来说说这篇文章和网上其他教程的区别。

如果你去搜以前的博客，大家都会教你用 `sdkmanager` 安装 SDK，用 `avdmanager` 创建虚拟机。但如果你在最新的命令行工具下运行 `sdkmanager`，会直接收到官方的一记当头棒喝：

```text
WARNING: The SDK Manager CLI tool (sdkmanager) is deprecated. Use Android CLI instead.
The 'android' binary can also be found in the cmdline-tools directory, and 'android sdk' is the replacement for 'sdkmanager'.
```

是的，Android 官方的 CLI 工具链其实经历过三代演进：

1. **第一代（远古版）**：`tools/` 目录下的旧版脚本（早已彻底废弃）。
2. **第二代（大家最熟悉的旧版）**：`cmdline-tools` 里的 `sdkmanager` 和 `avdmanager`（**现已被官方标记为 Deprecated**）。
3. **第三代（当前最新）**：统一的 `android` CLI 命令工具（集成了 `android sdk`、`android emulator` 等子命令）。

不仅主命令变了，**安装包的命名格式也发生了变化**：
- 旧版用分号：`platforms;android-36`、`system-images;android-36;google_apis;arm64-v8a`
- 新版统一用斜杠：`platforms/android-36`、`system-images/android-36/google_apis/arm64-v8a`

接下来，我们将完全基于**官方最新的统一 CLI** 来完成所有配置。

---

## 一、 准备工作与依赖安装

### 1. 确保 Java 运行时就绪 (JDK 17)
Android 开发和命令行工具依赖 Java 环境，推荐使用 **JDK 17 LTS**。
你可以通过 SDKMAN 或 Homebrew 安装：

```bash
java -version
```

输出类似如下即可：
```text
openjdk version "17.0.14" 2025-01-21 LTS
OpenJDK Runtime Environment
```

### 2. 通过 Homebrew 安装 Android 命令行工具
在终端执行：

```bash
brew install --cask android-commandlinetools
```

这会将最新的 Android SDK Command-line Tools 安装到 `/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin` 目录下。

---

## 二、 正确规划环境变量 (`~/.zshrc`)

很多同学在配置环境变量时，容易导致 Homebrew 安装的独立工具（例如 `brew install android-platform-tools`）和 SDK 内部的工具冲突，从而出现 `adb: device not found` 或版本不一致的问题。

我们把 SDK 的根目录统一设为 `~/Library/Android/sdk`，并在 `~/.zshrc` 中添加如下配置：

```bash
# Android SDK 根路径
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

# PATH 优先级：确保 SDK 自带的 platform-tools 与新版 CLI 优先于系统/Brew 默认工具
export PATH="/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

保存后刷新环境：

```bash
source ~/.zshrc
```

验证 CLI 工具是否正常被系统识别：

```bash
android --version
# 输出类似：1.0.15985488

which adb
# 输出必须指向 SDK 内部路径：
# /Users/你的用户名/Library/Android/sdk/platform-tools/adb
```

---

## 三、 实战：使用全新 CLI 安装 SDK 与配置模拟器

### 1. 一键安装必要组件与 ARM64 镜像
因为笔者使用的是 **Apple Silicon Mac**，所以模拟器镜像必须选择 `arm64-v8a`，这样能直接利用苹果芯片的虚拟化硬件加速，流畅度极高。

执行以下命令安装 Platform Tools、模拟器核心、API 36 平台及 ARM64 Google APIs 系统镜像：

```bash
android --sdk="$ANDROID_HOME" sdk install \
  platform-tools \
  emulator \
  platforms/android-36 \
  system-images/android-36/google_apis/arm64-v8a
```

> 如果你在第一步的准备工作中已经设置好了环境变量，并且你的 shell 也正确加载了环境变量，那么你可以省略 `--sdk="$ANDROID_HOME"` 参数，android CLI 会自动使用你环境变量中的 SDK 位置，所以本文后续将省略此参数。

安装完成后，可以查看已安装的包确认状态：

```bash
android sdk list "system-images/android-36/google_apis/arm64-v8a"
```

### 2. 创建 Android 虚拟设备 (AVD)
新版 CLI 提供了非常便捷的预设模板（Profile）。我们可以先查看可用的设备规格：

```bash
android emulator create --list-profiles
```

输出会列出预设配置：
```text
large_desktop
medium_desktop
medium_phone
medium_tablet
small_desktop
small_phone
```

这里我们直接基于 `medium_phone` 创建一台标准的手机模拟器：

```bash
android emulator create medium_phone
```

检查创建好的模拟器：

```bash
android emulator list
```

你会看到列表中出现了刚创建的设备 `medium_phone`。

### 3. 启动模拟器
使用新版 CLI 命令启动它（首次建议加上 `--cold` 执行冷启动）：

```bash
android emulator start medium_phone --cold
```

> **提示**：你也可以使用经典的 `emulator -avd medium_phone` 进行启动，两者在底层是互通的。

此时，一个崭新的 Android 模拟器窗口就会在你的桌面弹出了。

---

## 四、 设备联调与运行 Expo / React Native 项目

模拟器弹出来之后，不要急着立刻运行项目。我们需要确保两件事：**ADB 成功挂载** 且 **系统已经完全开机**。

保持模拟器运行，另起一个终端窗口检查：

### 1. 检查 ADB 连接状态
```bash
adb devices -l
```

预期输出：
```text
List of devices attached
emulator-5554    device product:sdk_gphone64_arm64 model:sdk_gphone64_arm64 device:emu64a
```

### 2. 检查系统是否开机就绪
使用系统属性探针检测系统启动状态：

```bash
adb shell getprop sys.boot_completed
```

只要返回 **`1`**，就说明 Android 系统所有的基础服务都已经启动完毕，可以开始接受应用的安装和调试了。

### 3. 启动 Expo 项目实测

- **普通 Expo 项目**：
  ```bash
  npx expo start
  ```
  在 Expo 的 CLI 菜单中直接按 `a`，Expo 会自动定位到正在运行的 `emulator-5554` 并在上面打开应用。

- **包含原生代码/原生插件的项目（如 JPush 等）**：
  ```bash
  npx expo prebuild
  npx expo run:android
  ```
  或者显式指定设备：
  ```bash
  npx expo run:android --device emulator-5554
  ```

整个构建与部署过程一气呵成，完全不需要 Android Studio 参与！

---

## 五、 环境排毒与磁盘瘦身

环境搭好后，建议顺手做一次“环境体检”，避免残留冗余文件或造成磁盘空间浪费。

### 1. 检查各组件磁盘占用
Android 镜像和 AVD 往往占用几 GB 到十几 GB 不等，可以查看具体占用情况：

```bash
du -sh "$ANDROID_HOME"/* "$HOME/.android/avd"
```

通常典型的大小分布为：
- `system-images`: 约 3~6GB（每个 Android 版本的系统镜像）
- `avd`: 约 1.5~2GB（虚拟设备的用户数据）
- `emulator`: 约 1GB
- `build-tools` / `platforms`: 几百 MB

如果以后不需要某个老版本的镜像，可以通过 `android sdk remove <包名>` 进行清理。

### 2. 清理 Brew 重复安装包
如果你之前通过 Homebrew 安装过 `android-platform-tools`，建议将其卸载，完全统一使用 SDK 内部的工具：

```bash
brew uninstall --cask android-platform-tools 2>/dev/null || true
```

---

## 六、 常用命令速查表 (Cheatsheet)

最后附上一份新版 CLI 的常用命令备忘录：

| 操作                | 命令                                        |
| ----------------- | ----------------------------------------- |
| 查看 CLI 版本与 SDK 信息 | `android --version` / `android info`      |
| 安装 SDK 组件 / 镜像    | `android sdk install <package>`           |
| 查看已安装 / 可用包       | `android sdk list "*"`                    |
| 查看模拟器预设规格         | `android emulator create --list-profiles` |
| 创建模拟器             | `android emulator create <profile>`       |
| 列出所有已创建模拟器        | `android emulator list`                   |
| 启动模拟器 (冷启动)       | `android emulator start <name> --cold`    |
| 检查 ADB 设备连接       | `adb devices -l`                          |
| 检查模拟器开机就绪状态       | `adb shell getprop sys.boot_completed`    |

---

## 结语

彻底摆脱 Android Studio 之后，整个开发流程不仅清爽了许多，终端的响应也更迅速了。

对于日常以 JavaScript / TypeScript 为主的跨端开发者而言，把精力聚焦在代码和轻量化的命令行工具上，既节省了宝贵的 Mac 磁盘空间，又搞清楚了底层 SDK、镜像和 ADB 之间的连接本质。

如果你也受够了庞大的 IDE，不妨试一试这套纯 CLI 的极简方案！

> 本文笔者全程使用 Macbook Air 进行操作，Windows/Linux 开发者可以将本文的思路作为参考，适当调整操作方式。