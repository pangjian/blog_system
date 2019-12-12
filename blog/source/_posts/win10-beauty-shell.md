---
title: 如何在 Win10 上打造一个漂亮的终端
date: 2019-02-01 08:15:05
categories: [技术]
tags: [shell, powershell]
photos:
- /resources/win10-beauty-shell/title.jpg
thumbnail: /resources/win10-beauty-shell/title.jpg
cover: /resources/win10-beauty-shell/title.jpg
---

Win的同学一定都会羡慕玩Mac的同学那一套漂亮的Shell吧，iTerm2 && Oh My Zsh搭配出来的效果让人流口水。下面就是我找到的别人搭配的终端效果图。
<!--more-->
![iterm2](/resources/win10-beauty-shell/iterm2.jpg)
我一直质疑为什么Win平台上不能有这么优秀的终端出现，我之前也玩过 Cmder，虽说比起自带的 cmd 已经强大了一个数量级，但是效果比 iTerm 还是差不少。最近，无意间让我发现了一个好东西-[FluentTerminal](https://github.com/felixse/FluentTerminal/tree/master/FluentTerminal.App),微软的[Fluent Design](https://www.microsoft.com/design/fluent/)大家一定听说过，FluentTerminal就是基于这种设计理念的终端模拟器，不多说了，先上我的最终效果图。
![FluentTerminal](/resources/win10-beauty-shell/FluentTerminal.png)

# 功能
从项目的说明文档上看，FluentTerminal支持下面的功能
* 支持 PowerShell、CMD、WSL和自定义shell（比如Cmder）
* 支持多个Tab或者多个窗口
* 支持自定义主题，支持导入iTerm主题

# 配置过程

## 1.下载[FluentTerminal](https://github.com/felixse/FluentTerminal/tree/master/FluentTerminal.App)
下载完成后按照官方说明，使用Powershell执行 Install.ps1 就可以全自动安装完成。

## 2.安装 [oh-my-posh](https://github.com/JanDeDobbeleer/oh-my-posh)
`oh-my-posh`是一个Powershell增强程序，有点类似Powershell版本的`oh-my-zsh`
我们可以使用 [PowerShell Gallery](https://www.powershellgallery.com/packages/oh-my-posh/2.0.245)来安装 oh-my-posh
```bash
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
```
想要配置生效，需要创建PowerShell 的配置文件
```bash
if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force }
notepad $PROFILE
```
在配置文件中增加如下几行
```
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Paradox #主题
```
最后一行是要设置的主题，主题有很多种，可以去官方仓库选一选，我使用的是Paradox主题
如果想要隐藏本机用户名还可以添加这行
```
$DefaultUser = '你的用户名'
```

## 3.安装字体
由于主题使用了一些字符，系统内的等宽字体无法显示，所以我们需要安装支持这些字符的字体库。有一个很好的[字体库](https://github.com/powerline/fonts)
下载完成后，执行 install.ps1 就可以把这些字体全部安装。你可以选择一个你喜欢的字体作为默认字体使用。但是我使用的是这个字体[Consolas NF](https://github.com/whitecolor/my-nerd-fonts)

## 4.设置FluentTerminal
将刚才安装的字体设置一下，
![设置1](/resources/win10-beauty-shell/setting1.png)
然后是设置颜色主题，我使用的主题是[Argonaut](https://github.com/effkay/iTerm-argonaut/),是一个iTerm主题，在Settings-Themes 可以直接导入

重启你的FluentTerminal效果就应该生效了。

# 问题记录
1. 为什么都是Github？
   醒醒吧孩子，不是Github难不成还是百度网盘么？
2. 如何去掉Powershell的启动版权信息？
   打开Settings-Profiles，找到Powershell，在Edit界面增加一个参数`-NoLogo`
3. 如何设置Cmder？
   在Cmder的[wiki页面](https://github.com/cmderdev/cmder/wiki/Seamless-FluentTerminal-Integration)有这个说明