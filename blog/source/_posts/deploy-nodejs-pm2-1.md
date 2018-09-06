title: nodejs部署方式-pm2(一)
date: 2016-12-02 13:02:10
tags: [Nodejs,pm2]
photos:
- /resources/deploy-nodejs-pm2-1/pm2.png
thumbnail: /resources/deploy-nodejs-pm2-1/pm2.png
---

目前Nodejs开发中有很多痛点，其中有一个是修改完代码以后需要我们重启服务才能看到效果。这样一次次的杀进程、重启，杀进程、重启很让人头大。程序员是最痛恨重复工作的物种，之前有了解过的同学可能知道`forever`。`forever`可以帮我们解决上面的问题，通过对资源变化的检测做到变化后自动重启。开发阶段我们使用`node file.js`来启动另外由于Nodejs的单线程，任何异常都会导致整个服务中断，这对于生产上长时间提供服务的程序来讲是不可以的，`forever`可以帮我们在异常后重启，保证服务一直在线，我想这也就是它名字的由来吧。但我想说的是`forever`不够“高！大！上！”。接下来我要介绍一个足够高大上的神器--[`pm2`](http://pm2.keymetrics.io)。

# 简介

`pm2`=**P**(rocess) **M**(anager)2，是可以用于生产环境的Nodejs的进程管理工具，并且它内置一个负载均衡。它不仅可以保证服务不会中断一直在线，并且提供0秒reload功能，还有其他一系列进程管理、监控功能。并且使用起来非常简单。下面我将把我的使用过程分享出来，Nodejs应用是一个基于Express 4.x的应用，名称是`Wolverine`。

<!--more-->

# 安装

环境清单：
- windows7 x64
- node v5.0.0
- npm 3.3.6

全局安装`pm2`

```bash
$ npm install pm2 -g
```
更新
```
$ pm2 update
```

# 启动

以前启动`Wolverine`是利用package.json的`scripts`来实现的，只需要执行`npm run start`就可以启动，配置如下：

```
"scripts": {
    "start": "node ./bin/www",
    "debug": "node debug ./bin/www"

  },
```

使用`pm2`我们可以在start处配置成 `pm2 ./bin/www`,命令后面支持加参数来实现watch、cluster多进程模式等功能。我不太喜欢一大串的命令，于是我使用了配置文件的方式。
在`Wolverine`的根目录，我创建了一个`processes.json`配置文件，配置文件内容如下，注释写的也很清楚了

```
{
  "apps" : [{
    "name" : "Wolverine",  //名称
    "script": "./bin/www", //程序入库
    "cwd": "./",           //根目录
    "watch":[
		"bin",
		"common",
		"configs",
		"public",
		"routes",
		"views"
	],//需要监控的目录
    "error_file":"./logs/app-err.log",//错误输出日志
    "out_file":"./logs/app-out.log",  //日志
    "log_date_format":"YYYY-MM-DD HH:mm Z" //日期格式
    }]
}

```

随后，我在package.json中增加了一条
```
"pm2": "pm2 start processes.json"
```
在启动就直接输入如下命令就好：
```
$ npm run pm2
```
看到下面的界面，就启动成功了，然后我们就可以关掉这个窗口了，服务不会因此停止，是不是高大上多了。
![pm2启动界面](/resources/deploy-nodejs-pm2-1/pm2-start.png)

# 管理和监控
启动成功的界面会展示App name和id，这两个值很重要。当然这两个值都可以在processes.json配置文件进行配置。
打开命令行，在任何路径下，输入
```
$ pm2 list
```
就能看到启动时的图表界面，方便我们查看所有通过pm2管理的Nodejs服务。

输入,下面命令配合id或者name可以查看某一个进程的详细信息
```
$ pm2 show Wolverine 或者
$ pm2 show 0
```
![pm2 list](/resources/deploy-nodejs-pm2-1/pm2-list.png)
内容涉及重启次数、运行时间、脚本路径、参数、日志路径、运行模式等等信息
输入
```
$ pm2 monit
```

停止、重启等命令

```bash
$ pm2 stop [app-name|id]  #停止某一个进程，可以使用app-name或者id
$ pm2 stop all            #停止所有进程

$ pm2 restart all         #重启所有的进程

$ pm2 delete [app-name|id]#删除并停止进程
$ pm2 delete all          #删除并停止所有进程
```

可以进一步查看每一个服务的cpu、内存动态占用情况。
![pm2 monit](/resources/deploy-nodejs-pm2-1/pm2-monit.png)

# 日志监控
如果你一直使用`tail -f log_file.log log_error.log`来查看日志，你可能会爱上下面的这个功能。

```
$ pm2 logs
$ pm2 logs [app-name]
```
我们可以实时查看全部进程的日志，或者只查看某一个。我们甚至可以使用json格式查看日志。
```
$ pm2 logs --json
```

# Web API

如果你不仅仅想监控被pm2管理的进程，还需要监控进程所运行的机器的信息，你可以使用下面这个API
```
$ pm2 web
```
pm2会启动一个叫做pm2-http-interface的进程提供web服务。你打开浏览器输入http：//127.0.0.1:9615，是不是被看到的结果惊艳到了。
![pm2-webapi](/resources/deploy-nodejs-pm2-1/pm2-webapi.png)
pm2提供的web api通过json输出了很多信息。大致结构可以看截图：
![pm2-webapi-json](/resources/deploy-nodejs-pm2-1/pm2-webapi-json.png)

拿出你的想象力，我们可以开发一个应用来调用此api，就可以开发出一个图形界面的监控软件了。。。

# 其它

pm2的优势和功能还不止这些，后续还会有文章详述更多高级的用法，比如进程恢复、图形界面，模块，甚至的功能开发。最重要的优势我想就是它的稳定性了，pm2的功能全部通过了测试，有超过1000个测试。同时提供Windows、MacOSX（OSX）、Linux的稳定版本。PayPal、微软、IBM等等大厂都在使用。我们已经有充分的理由把它应用到生产环境上。
EOF
<!-- indicate-the-source -->
