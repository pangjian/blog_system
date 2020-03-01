---
title: 为 Cypress 的 e2e 测试增加代码覆盖率检测
date: 2020-02-28 17:06:31
categories: [技术]
tags: [vue, e2e, javascript]
photos:
- /resources/e2e-test-cypress-code-coverage/istanbul.jpg
thumbnail: /resources/e2e-test-cypress-code-coverage/istanbul.jpg
cover: /resources/e2e-test-cypress-code-coverage/istanbul.jpg
---
之前写过一篇关于[如何使用Cypress进行端到端测试](/2019/05/17/how-to-do-e2e-test-with-cypress/)的文章, 介绍了如何给Vue项目添加端到端测试。我们也体会到了Cypress做端到端测试的方便，作为Vue内置在官方脚手架中推荐的测试框架，不少项目已经引入并开始使用了。当你的项目已经添加了Cypress端到端测试，你的内心一定会很在意“我的测试到底充不充分？有没有浪费过多的经历在测试上？”这两个极端的问题。
引用官方的一段话
> As you write more and more end-to-end tests, you will find yourself wondering - do I need to write more tests? Are there parts of the application still untested? Are there parts of the application that perhaps are tested too much? One answer to those questions is to find out which lines of the application’s source code were executed during end-to-end tests. If there are important sections of the application’s logic that were not executed from the tests, then a new test should be added to ensure that part of our application logic is tested.

我们可以通过添加代码覆盖率来从一定程度上减少我们这方面的顾虑。至少代码覆盖率能从一定程度上反映出测试的健康程度。前端代码测试覆盖率上的事实标准框架就是Istanbul了。本文就是结合了Cypress和Istanbul做到端到端的代码测试覆盖率的。官方也有一个教程[code coverage](https://docs.cypress.io/guides/tooling/code-coverage.html#Introduction),我也是参考了这篇教程，并且利用了官方提供的插件-[`@cypress/code-coverage`](https://www.npmjs.com/package/@cypress/code-coverage)。但是从目前的时间点来看（2020年2月29日），官方的教程并不能让你成功的在vue-cli创建出来的项目中做到代码覆盖率检查。那么下面就跟着我的顺序，来做吧。先奉上我[这篇文稿的Demo](https://github.com/pangjian/vue-cypress-coverage-example)

## 添加依赖库

前端代码覆盖率需要侵入修改我们的代码，在代码中插入一些探针来检查代码是否被执行。`nyc`是Istanbul的命令行工具，咱们也是利用这个工具来做到在代码中放置探针的工作的。但是命令行工具还是过于麻烦，我们需要先利用`nyc`修改我们的代码，然后以新的代码启动运行我们的项目，再做测试才可以收集到覆盖率情况。好在Istanbul提供了babel工具实时转换我们的代码。
所以我们需要安装依赖

```shell
npm i -D @cypress/code-coverage nyc istanbul-lib-coverage babel-plugin-istanbul@5.2.0
```

### 配置

### 配置cypress插件

在Cypress的support文件和plugins文件中分别添加下面的代码
```javascript
// tests/e2e/support/index.js
import '@cypress/code-coverage/support'
```

```javascript
// tests/e2e/plugins/index.js
module.exports = (on, config) => {
  on('task', require('@cypress/code-coverage/task'))
}
```

### 配置nyc
在项目根目录添加.nycrc文件
```json
// .nycrc
{
  "extension": [".js", ".vue"], // 这里配置支持的文件类型
  "include": ["src/**/*.{js,vue}"],
  "all": true,
  "sourceMap": false,
  "instrument": false,
  "per-file": true
}
```

### 配置babel

在babel配置文件中添加babel-plugin-istanbul插件
```javascript
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}

// Only instrument code when running e2e tests
if (process.env.npm_lifecycle_script === 'vue-cli-service test:e2e') {
  console.log('Instrument the code')
  module.exports.plugins = [
    ['istanbul', {
      useInlineSourceMaps: false
    }]
  ]
}
```
这段就是只有在进行端到端测试的时候才往babel中添加这个插件，避免影响性能。

## 运行
这时候，所有的配置都完成了，相信注意看的同学都注意到了，我们安装了babel-plugin-istanbul的5.2.0版本，目前最新版是6.0.0，为什么不安装最新版呢？答：因为有坑啊！而且目前网上所有地方都没有提到这个坑。也就是6.0.0版本与5.2.0版本有一个巨大的差异，也就是读取nyc配置文件的方式发生了变化，但是官方的[ChangeLog](https://github.com/istanbuljs/babel-plugin-istanbul/blob/master/CHANGELOG.md)里面都没有提到。
TODO此处插入依赖对比图
此处的差异导致了6.0.0版本按照我们这种方法进行配置，并不能正常读取nyc的配置。我们配置了支持的扩展名称（vue和js），这个配置不能生效，导致代码覆盖率跑出来就只支持默认的js文件了。所以我们才引入了5.2.0版本。但是说不定babel-plugin-istanbul后续的版本可以解决这个问题，那时候就可以放心安装最新版了。

激动的时刻到了，接下来我们运行
```shell
npm run test:e2e
```
可以看到e2e测试正在运行，通过关键点可以看出代码覆盖率生效了

![测试截图](/resources/e2e-test-cypress-code-coverage/e2e-run.png)

测试跑完以后，代码覆盖率报告可以在coverage文件夹内看到了。

![测试报告](/resources/e2e-test-cypress-code-coverage/report.png)

与CI系统结合的话，我们通常需要一个纯text版本的覆盖率信息，利用nyc可以生成。
执行下面的命令

```shell
npx nyc report

npx nyc report --reporter=text-summary
```

![CI测试报告](/resources/e2e-test-cypress-code-coverage/ci-report.png)