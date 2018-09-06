title: 使用travis-ci持续集成Hexo静态博客
tags:
  - hexo
  - travis-ci
photos:
  - '/resources/travis-ci-hexo/travis-ci.png'
thumbnail: '/resources/travis-ci-hexo/travis-ci.png'
categories: []
date: 2016-05-25 15:37:00
---
Hexo是一个基于Nodejs的轻量级静态博客生成框架。静态博客生成程序会将我们所写的博客生成为一套HTML+CSS+JavaScript代码，我们将这个代码部署到诸如Github Page这样的地方就可以在世界任何一个地方访问我们的博客了。这种方案有一个非常有利的优点--免费。但是，hexo环境不是处处都有，换个地方写作变成了一件麻烦事。而且写完文章以后需要`hexo g`，`hexo d`等一系列操作，着实很麻烦。本篇文章利用Travis CI解决以上痛点。
<!--more-->
# 简介
Travis CI提供一个在线的持续集成服务，用来构建托管在github上的代码。许多知名的开源项目使用它来自动构建测试代码。它支持hexo的运行环境node.js。原理很简单，Travis会在你每一次在github上提交代码后，生成一个Linux虚拟机来运行你配置好的任务。生成和部署hexo只需要一个命令`hexo gd`，但是Travis CI需要有我们的github项目上传代码的权限，所以我们需要使用SSH key来使Travis CI拥有权限。还有一些其他的问题也都参开hexo作者的博文解决了，[用Travis CI自动部署网站到Github](http://zespia.tw/blog/2015/01/21/continuous-deployment-to-github-with-travis/)
# 配置SSH Key
## 生成SSHKey
此步骤网上教程较多，此处只是简单介绍。
```
ssh-keygen -t rsa -C "youremail@example.com"
```
按要求操作后会生成两个文件`id_rsa`和`id_rsa.pub`,然后加入SSH agent。
```
ssh-add ~/.ssh/id_rsa
```
然后，我们将id_rsa.pub中的内容添加到github中，如果你还使用其他Page服务，也需要添加到对应的托管平台。我就在同时使用Coding.net。

## 加密私钥
我们不可能把代码库的SSH key直接上传到代码库，那样任何人都可以有权限往你的代码库中提交代码，这是不安全的。这一步操作就是为了解决这个问题。将私钥加密后上传，Travis CI在构建的时候解密。
安装travis-ci的命令行工具
```
gem install travis
```
登录Travis CI
```
travis login --auto
```
使用travis命令行工具加密私钥
```
travis encrypt-file ssh_key --add
```

## 指定SSH设置
在根目录下新建文件`ssh_config`,内容见我的设置,我同时设置了两个page服务。
```
Host github.com
  User git
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes

Host git.coding.net
  User git
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/id_rsa
  IdentitiesOnly yes
```

## travis CI解密配置

这部分内容需要配置在`.travis.yml`里,注意修改秘钥

```shell
- openssl aes-256-cbc -K $encrypted_26b4962af0e7_key -iv $encrypted_26b4962af0e7_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
```

# 我的`.travis.yml`配置

上面的描述如果有不明白的地方直接查看我这份完整版的配置文件，拿去修改就可以直接使用。

```
language: node_js

node_js:
- '4.1'

before_install:
- openssl aes-256-cbc -K $encrypted_26b4962af0e7_key -iv $encrypted_26b4962af0e7_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa
- eval $(ssh-agent)
- ssh-add ~/.ssh/id_rsa
- cp ssh_config ~/.ssh/config
- git config --global user.name "pangjian"
- git config --global user.email "pangjian1010@gmail.com"

install:
- npm install hexo-cli -g
- npm install

script:
- hexo -version
- hexo clean
- hexo g
- hexo deploy

```

EOF
<!-- indicate-the-source -->
