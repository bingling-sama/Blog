---
tags: [Life]
categories: [Life]
date: 2022-08-12 10:08:51
title: Windows 下添加小鹤双拼
---
# Windows 下添加小鹤双拼

双拼最近越来越火了，我也在尝试学习，但是 Windows 自带的微软拼音输入法却没有自带小鹤双拼码表，如果自己一个键一个键的添加不仅麻烦还容易出错，所以我找到了这种修改注册表的添加方式。

## 手动添加

打开 Windows Powershell，执行以下命令：
```shell
New-ItemProperty HKCU:\Software\Microsoft\InputMethod\Settings\CHS\ -name "UserDefinedDoublePinyinScheme0" -value "小鹤双拼*2*^*iuvdjhcwfg^xmlnpbksqszxkrltvyovt" -propertyType string # 添加小鹤码表

gpupdate /force /wait:0 # 刷新注册表
```

## 自动添加

可以在本站 [此处](https://blog.booling.cn/files/xiaohe.ps1) 下载 `.ps1` 脚本，运行即可。


## 使用

添加完毕后即可在 `Windows 设置/时间和语言/语言和区域/微软拼音输入法/常规` 中选择 `小鹤双拼` 使用。

