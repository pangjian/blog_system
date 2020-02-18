---
title: 如何用 docker 部署 gitea 并开启两步认证
date: 2020-02-17 08:50:27
categories: [技术]
tags: [git, gitea]
photos:
- /resources/how-to-deploy-gitea-with-docker/gitea.png
thumbnail: /resources/how-to-deploy-gitea-with-docker/gitea.png
cover: /resources/how-to-deploy-gitea-with-docker/gitea.png
---
[Gitea](https://gitea.io)是[Gogs](https://gogs.io)的fork版本，是一个可以自行搭建的git服务器。两者均是开源的，托管在github上。有了Gogs为什么又会有Gitea呢,是由于社区认为Gogs的管理模式不利于社区发展,于是自立门户,他们之间的恩怨情仇我们不去讨论,有兴趣的可以看这个,[传送门](https://blog.gitea.io/2016/12/welcome-to-gitea/)。我为什么选择Gitea呢？是因为Gogs已经大半年没更新过版本了，Gitea维护非常积极。但是，说到底Gitea和Gogs差异不大，部署流程也是大同小异。



## 安装

### 环境说明
我打算部署在我的vps上，是购买的Vultr的。如果你也有Vps需求，可以使用[我的链接](https://www.vultr.com/?ref=7248669)注册，这样你我都会有$10奖励。
操作系统:Ubuntu 18.04
我使用了DaoCloud管理了我的VPS上所有的Docker镜像，我所有的应用都已经Docker化了，并且设置了自动部署，后续可能会写篇文章做一下介绍。

<!--more-->

![我的Docker清单](/resources/how-to-deploy-gitea-with-docker/docker-image-list.png)

### 安装Gitea
配置DaoCloud的步骤这里省略了。本文基于你已经配置好VPS和DaoCloud服务了。
因为Git服务器需要存储数据，是存储在容器外的，所以我们先在VPS上创建一个文件夹用来存储数据。
```shell
mkdir /gitea
```
在Daocloud的发现镜像菜单可以直接搜索docker hub内容，可以搜索到gitea的官方镜像 gitea/gitea。

![搜索镜像](/resources/how-to-deploy-gitea-with-docker/daocloud-dockerhub.png)

在镜像出点击“部署”

![部署](/resources/how-to-deploy-gitea-with-docker/deploy.png)

在容器配置页面配置上对应的参数,分别是端口映射和数据存储路径

![设置](/resources/how-to-deploy-gitea-with-docker/setup.png)

容器的3000端口对应的是web服务的端口，这里我们按照官方习惯映射为10080。22为ssh端口，我们映射为10022。容器的数据路径`/var/lib/gitea`映射为我们刚才创建的`/gitea`。最后点击立即部署，等待部署完成，就可以通过`http://你的ip或域名:10080`访问gitea了。

![gitea](/resources/how-to-deploy-gitea-with-docker/gitea.png)

接着设置一下管理员账号和一些初始化参数,就可以正常使用了。

## 两步认证
Gitea最基础只有用户名和密码来保护你的账户，这样还是不太放心，可以利用支持的两步认证功能来加强账户安全，更好的保护托管在上面的代码。这样每次登录都需要输入一个6位动态验证码，这样即使密码泄露，也无法登录账户。

### 设置两步认证
Gitea和Gogs其实都是支持的。
首先登录账号，然后在设置-安全里面可以看见两步认证的选项，有一个大大的二维码。添加两步认证非常简单，使用两步认证器App扫描二维码就可以。市面上有很多的两步认证验证器。我测试可以的有下面这几个。
* Step Two：界面美观，可惜只有iOS版本。[下载链接](https://apps.apple.com/cn/app/step-two/id1291130842)
* 宁盾令牌: iOS和Android都支持。[下载链接](https://mtc.ndkey.com/mtc/appDownload/index.html)
<div style="width:50%">
![Otp](/resources/how-to-deploy-gitea-with-docker/otp.png)
</div>

### 同步代码的设置
因为开启了两步认证，我们无法在通过basic认证同步代码。那怎么办呢？答案是我们可以使用access token。access token类似Gitea给你生成了一个非常长的密码，你可以使用用户名+access token来同步代码。
在个人设置-应用菜单里面可以生成一个access token。生成完成以后记得拷贝出来，因为页面关闭以后就再也无法看到了。

![access token](/resources/how-to-deploy-gitea-with-docker/accesstoken.png)

### 如何避免每次同步都输入access token
在已经clone到本地的git仓库里面找到`.git`文件夹，打开`config`文件。修改remote里的url，在域名前面加入"用户名:accesstoken@"，比如原来是`http://example.com/pangjian/test.git`改为`http://pangjian:xxxxxxxxxxxaaaaasasd@example.com/pangjian/test.git`
这样,每次同步都不用再输入access token了。至此，就全部设置完成了。

<!-- indicate-the-source -->