title: 升级Hexo2.X到3.0
date: 2015-04-11 21:47:32
categories: [技术]
tags: [hexo]
photos:
- /resources/hexo-update-to-3-0/hexo3a.png
- /resources/hexo-update-to-3-0/hexo3b.png
thumbnail: /resources/hexo-update-to-3-0/hexo3a.png
cover: /resources/hexo-update-to-3-0/hexo3a.png
---
我一般不想转或者写别人写过的一些东西，但是今天这篇文章算是转的，完全记录了我升级hexo的过程。为什么呢？实在是觊觎了很久了，一直没敢动手，3.0版本可是个大手术，据说好多主题和插件都挂了，现在这个主题我修改了不少，怕万一出个什么问题很麻烦。仅以此文来记录这次没什么意外地升级。

## Hexo3.0新特性
* 新的命令行工具：hexo-cli
* 更轻量级的核心模块：generators，deployers和server都从主模块中分离出来了
* 新的generator Api
* 支持时区
* [更多](https://github.com/hexojs/hexo/wiki/Breaking-Changes-in-Hexo-3.0)

<!--more-->

## 下面是操作步骤
### 更改package.json
给`package.json`添加`hexo`
```json
{
    "hexo":{
        "version":""
    }
}
```

### 清除缓存
```shell
hexo clean
```

### 全局安装hexo-cli
```shell
sudo npm install hexo-cli -g
```

### 安装hexo
新的hexo不安装在全局了
```shell
npm install hexo --save
```

以下的模块是按需安装
***
### 安装generators
从插件的名字就拿看出来它是干什么的
```shell
npm install hexo-generator-index --save
npm install hexo-generator-archive --save
npm install hexo-generator-category --save
npm install hexo-generator-tag --save
```

### 安装server
这个用于本地调试的server一般人都会装
```shell
npm install hexo-server --save
```

### 安装deployers
我是部署在github和gitcafe上的，所以只安装了git的deployer
```shell
npm install hexo-deployer-git --save
npm install hexo-deployer-heroku --save
npm install hexo-deployer-rsync --save
npm install hexo-deployer-openshift --save
```

### 更新插件
```shell
npm install hexo-renderer-marked@0.2 --save
npm install hexo-renderer-stylus@0.2 --save
npm install hexo-generator-feed@1 --save
npm install hexo-generator-sitemap@1 --save
```

## 测试
打完收工，看看成果吧

```shell
hexo g
hexo server
```

浏览器打开`127.0.0.1:4000`看看效果
![pangjian.info](/resources/hexo-update-to-3-0/pangjian.info.png)

还算是顺利，虽然部分国际化内容变成了繁体中文，是因为我没有指定语言的过，写了一个`en-US.yml`然后在`_config.yml`中指定语言为`en-US`。刷新，大功告成。
<!-- indicate-the-source -->
