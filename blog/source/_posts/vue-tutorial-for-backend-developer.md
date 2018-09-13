title: 写给后端开发者看的Vue前端介绍（一）--基础篇
date: 2017-04-05 16:51:15
categories: [技术]
tags: [vue, javascript, nodejs]
---
不懂“前端er”说的 virtual dom、React、Angular、Vue，也不懂 ES6 为什么就这么优雅，更不知道为什么用 Bootstrap、jQuery 就得“剁手”，甚至不懂前端生态圈的重复造轮子文化。终于有一篇文章是写给后端工程师的前端介绍，后端写给后端看的。
我打算从最近火热的`Vue`来介绍，一方面由于这套框架简直火的一塌糊涂；另一方面，这套框架涉及的技术栈范围全面，“几乎”可以包含你要掌握的一切。
## 初探`Vue`
Vue.js（读音 /vjuː/，类似于 view） 是一套构建用户界面的渐进式框架。与其他重量级框架不同的是，Vue 采用自底向上增量开发的设计。Vue 的核心库只关注视图层，它不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与单文件组件和 Vue 生态系统支持的库结合使用时，Vue 也完全能够为复杂的单页应用程序提供驱动。

## Nodejs & npm
在软件开发领域，前端工程师层是一个比较纠结的职业，在web技术真正发展起来之前的一段时间里，由于技术门槛低，很多人并不具备什么专业技能。所以当时很多人并不把使用 HTML、CSS、JavaScript 的人称为“工程师”，他们认为“这些技术看起来都是如此简单，随随便便混在一起用就哦了”。Nodejs 一发布，JavaScript，这门很多工程师曾经把它当做玩具而不屑一顾的脚本语言悄然演变成推动互联网发展的核心驱动力。借助 Nodejs 的帮助，JavaScript 可以运行在服务器，并且由其开发而来的一系列工具，比如 Webpack 等，为前端工程化提供了强有力的保障。“前端工程师”也正式被大家所接受和承认。
Nodejs 是一个 javascript 执行环境，V8 给 Chrome 浏览器带来了一个强劲的心脏，Nodejs 便是基于这个心脏，正是 V8 强大的性能，使得 JavaScript 的后端实现在性能和编程模型等方面达到了和其他语言一较高下的程度。由于 JavaScript 的异步 IO 和事件机制使得 Nodejs 非常擅长解决 IO 密集型应用，
npm 是 Nodejs 的包管理器，如果不好理解，可以把它类比成为 Maven。类比 Maven 的`pom.xml`配置文件，npm 使用的`package.json`来描述包。`package.json`中通常会包含包名、包简介、版本号、维护者列表、包依赖、脚本和一些其他的描述信息。

## Webpack
有了 Nodejs、npm 之后进入了“全面造轮子”的时代，各种工具、各种库、各种场景野蛮生长。其中有一小撮群众迫切的需要一个打包工具。前端由 HTML、CSS、JS 组成，但基于部署要求以及性能优化等各方面要求，需要针对代码进行合并、打包甚至压缩。于是 Grunt、Glup、Webpack 等工具应运而生，之所以选择 webpack，是因为 build 工具中 Webpack 凭借其强大的功能已经“千秋万代、一统江湖”了。所以我们可以无视 Grunt、Glup 之类的。

## 再谈`Vue`
铺垫了这么久，终于迎来了主角登场。以下将通过一些示例来解释“什么是Vue？”，以及“Vue的优势”。
### 起步
作为一个“渐进式框架”，Vue 适用于小型到大型项目的几乎所有场景。我们可以直接在HTML页面中引用vue.js,比如：
```html
<script src="https://unpkg.com/vue/dist/vue.js"></script>
```
这种场景，甚至可以仅仅在页面的某一个模块下面使用Vue框架而不影响现有代码。
也可以使用官方提供的工具`vue-cli`，结合 Webpack 的强大功能，构造一个有着完整流程的 SPA （单页面应用）
### 双向数据绑定
如果你之前使用过类似`jQuery`的 DOM 操作框架，双向数据绑定的特性一定会惊艳到你。
假设有这样一个需求，要求客户输入的信息随着客户输入的同时实时显示在页面上。就像下面这样

![双向数据绑定](/resources/vue-tutorial-for-backend-developer/vue_databinding.gif)

如果使用 jQuery 实现，我们需要在输入框上监听`onkeydown`事件，在事件回调中将用户输入的数据通过操作 DOM 的方式显示在页面上。看起来也不是很难嘛。可是你想过么，如果需求变成了当后台返回的数据修改了页面展示的内容时，输入框内容也需要变化。那你就要写一堆的事件回调来监听 DOM 和输入的每一个变化，会大大增加编码的复杂程度，并且使代码变得几乎不可维护。

如果使用 Vue 实现会是什么样呢？

```html
<div id="app">
  <p>{{ message }}</p>
  <input v-model="message">
</div>
```

```javascript
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

这就是双向数据绑定！把 p 标签的展示内容和 input 输入的内容都与 data 中的 message 绑定，这样一来，input 内容的变化会改变 message 同时 vue 会将变化自动变更到 p 标签上。我想你一定能体验到双向数据绑定的魅力了。有了这种奇妙的特性，我们已经无需手工操作 DOM 了，一切都是数据，数据的变化自动会体现到页面的变化上去，我们再也不需要 jQuery 之类的了。
### 组件化应用
组件系统是 Vue 的另一个重要概念，因为它是一种抽象，允许我们使用小型、自包含和通常可复用的组件构建大型应用。仔细想想，几乎任意类型的应用界面都可以抽象为一个组件树：

![组件树](/resources/vue-tutorial-for-backend-developer/component_tree.png)

当我们创建了一个组件后

```javascript
// 定义名为 your-component 的新组件
Vue.component('your-component', {
  template: '<li>这是个待办项</li>'
})
```

我们可以这样使用它

```html
<ol>
  <!-- 创建一个 your-component 组件的实例 -->
  <your-component></your-component>
</ol>
```

我们可以定义新的 HTML 标签，基于这个特性，我们可以开发一套自有的组件库，使开发者可以通过标签的方式引入我们的组件。

### 单文件组件
在很多Vue项目中，我们使用 `Vue.component` 来定义全局组件，紧接着用 `new Vue({ el: '#container '})` 在每个页面内指定一个容器元素。
这种方式在很多中小规模的项目中运作的很好，在这些项目里 JavaScript 只被用来加强特定的视图。但当在更复杂的项目中，或者你的前端完全由 JavaScript 驱动的时候，下面这些缺点将变得非常明显
* 全局定义(Global definitions) 强制要求每个 component 中的命名不得重复
* 字符串模板(String templates) 缺乏语法高亮，在 HTML 有多行的时候，需要用到丑陋的 \
* 不支持CSS(No CSS support) 意味着当 HTML 和 JavaScript 组件化时，CSS 明显被遗漏
* 没有构建步骤(No build step) 限制只能使用 HTML 和 ES5 JavaScript, 而不能使用预处理器，如 Pug (formerly Jade) 和 Babel

文件扩展名为 .vue 的 single-file components(单文件组件) 为以上所有问题提供了解决方法，并且还可以使用 Webpack 或 Browserify 等构建工具。
这是一个文件名为 Hello.vue 的简单实例：
![单文件组件](/resources/vue-tutorial-for-backend-developer/vue-component.png)
有了 `.vue` 组件，我们就进入了高级 JavaScript 应用领域。是 Vue 框架前端工程化的前提。

## 单向数据流`Vuex`
这部分内容本该属于高级内容，但是它重要到基础篇中就应该预先了解一下。
Vuex 是特地为 Vue 框架打造的 Flux 技术实现。
我必须先解释一下 Flux 到底解决什么问题。Flux 是一种应用处理的数据的模式。虽然 Flux 和 React 一同在 Facebook 成长起来的，很多人把它们合到一起来理解，但你可以单独使用它们。它们是被设计来解决一些 Facebook 碰到的一系列问题的。
一个众所周知的例子就是关于通知的 Bug。当你登录 Facebook 后，可能会看到在消息 icon 上有一个通知。当你点击消息 icon，却发现并没有新的消息，然后通知不见了。几分钟之后，你在网页上做了一些交互，通知又回来了，你再一次点击消息 icon……但并没有新消息。然后就进入周而复始的循环。
Facebook 的工程师发现，更深层次的问题来自应用的数据传递问题。
他们用 Model 保存数据，并把数据传递一个 View 层，把这些数据渲染出来。
由于用户通过 View 层来交互，View 有时需要根据用户的数据更新 Model。还有时 Model 需要更新其他的 Model。
在这种情况下，有时候有些操作会触发一连串的变化。我把这想象成一种激动人心的乒乓游戏——很难判断球的落点在哪里（或者是跑到了屏幕之外。）
还有一个这样的事实，有些变化可能是异步的。一个变化会引起多个其他的变化。我想象下就像在乒乓游戏了直接撒了一袋子乒乓球，它们散落在各个地方，并互相穿梭。
因此 Facebook 决定尝试另外一种架构，即单向数据流——就一个方向——当你需要插入新的数据，流完全重新开始。他们把这种架构称为 Flux。

![Flux](/resources/vue-tutorial-for-backend-developer/flux.jpg)

你也许了解了 Vuex，也许没有，总之下一篇进阶篇会详细介绍这部分内容。

## 更多
更多内容敬请期待进阶篇。将要包括:
* Vuex
* Vue开发环境
* 单元测试
* 自动化以及持续集成
