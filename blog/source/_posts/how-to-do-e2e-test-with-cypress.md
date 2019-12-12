---
title: 如何使用`Cypress`进行端到端测试
date: 2019-05-17 11:05:20
categories: [技术]
tags: [e2e, javascript]
photos:
- /resources/how-to-do-e2e-test-with-cypress/cover.jpg
thumbnail: /resources/how-to-do-e2e-test-with-cypress/cover.jpg
cover: /resources/how-to-do-e2e-test-with-cypress/cover.jpg
---

## 简介
[`cypress`](http://www.cypress.io) 是一个端到端(end to end)测试框架。它基于`mocha`式 API ，提供一整套端到端测试的解决方案，无需再安装其他的测试库，对webpack友好，并提供一套强大的图形界面工具，语法简单符合直觉，上手容易。测试浏览器基于`Chrome`或者`Chrome`的变种浏览器，比如`electron`、`Chromium`
<!--more-->
### 优势
* 自带完整解决方案， 无需安装其他测试库
* API简单符合直觉，上手容易
* 自带一套图形界面工具，可以方便查看测试过程
* 测试的每一步都有 snapshot（注意不是截图而是真正的DOM！），可以查看每一步的状态，仿佛是时光机器
* 自带数据 mock 机制
* 支持`webpack`配置

## 安装
环境要求：
* macOS 10.9 以上，只支持 64-bit
* Linux Ubuntu 12.04 以上， Fedora 21 Debian 8，只支持64-bit
* Windows 7 以上

## 在线安装
在线安装会在`npm`安装依赖时自动下载`cypress.zip`文件

### 常规安装
```
cd /your/project/path

npm i -D cypress
```
执行下面命令进行初始化，创建配置文件和相关文件夹。
```
./node_modules/.bin/cypress open
```
或者使用`npx`
```
npx cypress open
```

### 基于 `vue-cli 3`安装
前提是你的工程基于`Vue-CLI 3`创建
```
vue add @vue/e2e-cypress
```
如果你使用的是`vue-cli 3`方式安装的，则配置文件以及相关的文件夹都创建好了

## 离线安装
如果你处于无互联网的环境下， 你也可以选择手工下载`cypress.zip`的方式安装。可以选择官网或者淘宝的npm镜像下载对应平台的`cypress.zip`，下载后不用解压缩。
在系统中配置环境变量`CYPRESS_INSTALL_BINARY`为你下载的`cypress.zip`路径即可。后续流程与在线安装相同。这样npm在安装依赖的时候就不会在线下载了，会选用本地的文件。

但是如果你想跳过下载，可以吧`CYPRESS_INSTALL_BINARY`设置为0。

## 配置
> 为了方便，这里的配置是基于`vue-cli 3`方式创建的目录进行说明的。

首先增加`npm`运行脚本, package.json的脚本里增加下面的配置
```json
{
  "test:e2e": "vue-cli-service test:e2e --mode development --headless",
  "test:e2e-gui": "vue-cli-service test:e2e --mode development",
}
```
"test:e2e"为无头模式运行测试，"test:e2e-gui"为GUI模式运行测试

`cypress`的配置文件为`cypress.json`, 与`package.json`在同级目录。
我的配置文件如下
``` json
{
  "pluginsFile": "tests/e2e/plugins/index.js",
  "reporter": "mochawesome",
  "reporterOptions": {
    "reportDir": "tests/e2e/results",
    "overwrite": false,
    "html": true,
    "json": true
  },
  "viewportWidth": 1024,
  "viewportHeight": 768
}
```
* `pluginsFile`是插件的入口文件位置
* `reporter`是测试报告框架，`mochawesome`需要单独安装
* `reporterOptions`是测试报告框架的配置信息
* `viewportWidth`和`viewportHeight`为测试浏览器窗口的宽度和高度，单位是像素

完整的配置信息可以在`cypress`的 GUI 中查看

![设置](/resources/how-to-do-e2e-test-with-cypress/settings.png)

## 第一个测试案例
`tests\e2e\specs`文件夹下面存放的就是测试脚本，新建一个`test.js`，写入下面的代码
```javascript
describe('My First Test', () => {
  before(() => {
    // 在全部案例执行之前执行一次
  })
  after(() => {
    // 在全部案例执行完成之后执行一次
  })
  beforeEach(() => {
    // 在每一条案例之前执行
  })
  afterEach(() => {
    // 在每一条案例执行完成之后执行
  })

  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('首页')
  })
})

```

然后执行`npm run test:e2e-gui`, 就可以看到`cypress`启动了你的应用，并且进行了首页的测试。

### 测试案例的一般结构
1. 准备应用程序环境，比如访问页面，定位到相应的功能
2. 执行一个测试动作， 查找一个元素，并对元素进行一个操作
3. 执行一个断言来验证测试的结果

## 常用api
`cypress`支持丰富的 api，如果要写一个简单但是完整的测试案例几乎100% 需要下面几个常用的 api

### 访问页面 visit

使用`cy.visit(url)`可以访问一个 URL
比如
```javascript
cy.visit('http://localhost:2000)
```
`visit`也支持参数`cy.visit(url, option)`可以设定访问的方法是 POST 还是 GET、header 是什么、认证信息等等。
具体的 api 说明地址 [visit api](http://docs.cypress.io/api/commands/visit.html)

### 查找一个元素 get
`cy.get(selector)`可以通过 CSS 选择器来选择一个或多个元素。如何方便快速的查询一个元素的`selector`呢? Chrome 的开发者工具已经提供了对应的功能。在开发者工具的 Element页下，选择你需要定位的元素，点击右键 -> copy -> copy selector。
![copy selector](/resources/how-to-do-e2e-test-with-cypress/copy-selector.gif)

### 验证一个元素是否存在 contains
如何判断页面上是否存在某个元素呢？使用`cy.contains()`可以通过元素的内容而不是 CSS 选择器来查找一个元素。如果页面中包含一个内容为“首页”的元素，就可以这样查找
```javascript
cy.contains('首页')
```
如果页面确实有"首页"元素，案例就会通过，否则案例就会失败

### 点击 click
`.click()`可以跟在查找元素表达式的后面，比如
```javascript
cy.contains('登录').click() // 或者
cy.get('#login').click()
```

### 输入 type
使用`.type(String)`可以输入输入一段内容。比如
```javascript
cy.get('input').type('hello,world')
// 也可以输入控制字符，使用{}扩住即可,比如回车
cy.get('input').type('welcome{enter}')
```
控制字符支持很多除了enter还有ctrl、alt、shift等等，详见[api文档](http://docs.cypress.io/api/commands/type.html#Arguments)

## 最佳实践

### 如何在每一个案例执行之前先登录
一个功能较为完整的系统，通常都包含权限控制。所以，在测试某个功能之前有一个前置条件，那就是需要登录。在每一个案例执行之前手写测试代码进行登录是一件很繁琐的事情。我们可以利用`cypress`的 `commands` 来实现快速登录的需求。`commands`是一个扩展`cypress`的`api`的方式，通过自己实现`commands`就能通过`cypress.commands`的方式进行调用了。
我们增加一个叫做login的commands, 传入用户名密码进行登录，类似这样`cy.login(username, password)`
在`tests\support\commands.js`中新增一个定义
```javascript
Cypress.Commands.add("login", (username, password) => {
  cy.visit('/#/login-page') // 访问登录页面
  cy.get('#username')
    .type(username) // 输入用户名
  cy.get('#secpwd').type(password) // 输入密码
  cy.get('#login_btn')
    .click()      // 点击登录按钮
})
```
接下面我们来写一个简单的案例, 来实现先登录，后进行测试。
```javascript
it('Visits the app root url', () => {
    cy.login('username', 'password')
    cy.visit('/')
    cy.contains('首页')
  })
```

### 如何优雅的查找一个元素
查找和定位一个元素应该是最常用的功能了，`cypress`提供了两种查找元素的方式，`cy.get(selector)`和`cy.contains(text)`。通过元素的内容定位元素看上去很美好，官方也比较推荐，但是碰到具有相同内容的元素该怎么办？通过css选择器来进行定位看似比较靠谱，因为如果一个元素有唯一id的话最好说，但是不可能所有元素都有id的，于是我们使用Chrome开发者工具生成的选择器进行选择，但是这个选择器通常长这个样子
`#content-body > div > div.info-well > div.well-segment.pipeline-info` 
。虽然准确无误，简单方便。但是，一点也不优雅，这么长的表达式对于阅读代码的人简直是噩梦，另外如果页面的css样式发生变化，很有可能这个表达式也需要发生变化。
这里笔者最推荐的做法就是，使用属性查找，在编写页面代码时就考虑测试案例的写法，编写“可测试的”代码。举个例子，
```html
<button class="btn btn-large" data-test="login">登录</button>
```
给这个按钮增加一个`data-test`的属性，并在当前功能页面唯一。这样就可以这样查找这个元素
```javascript
cy.get('[data-test=login]')
```
这样做的好处就是，可以应对变化，页面的css、页面的内容变化时，这个查找仍然生效。需要做的就是在开发页面时就考虑到如何测试，编写“可被测试”的代码是一个良好的编码习惯。

### 使用beforeEach和afterEach钩子
我们通常有需求，要在测试案例之前做初始化动作，在测试案例之后执行清理动作，就利用到了cypress提供的几个钩子函数。
比较容易理解，直接上代码
```javascript
describe('My First Test', () => {
  before(() => {
    // 在全部案例执行之前执行一次
  })
  after(() => {
    // 在全部案例执行完成之后执行一次
  })
  beforeEach(() => {
    // 在每一条案例之前执行
  })
  afterEach(() => {
    // 在每一条案例执行完成之后执行
  })

  it('Visits the app root url', () => {
    cy.login('zmq001', 'a1111111')
    cy.visit('/')
    cy.contains('h1', 'Welcome to Your Vue.js App')
  })
})
```