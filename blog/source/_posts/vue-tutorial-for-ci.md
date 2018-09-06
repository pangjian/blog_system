title: 写给后端开发者看的Vue前端介绍（二）--单元测试
date: 2018-01-12 10:41:27
tags: [vue, javascript, ci]
---

上一篇“基础篇”聊到了一些`Vue`、`Nodejs`、`Webpack`的基本概念。本篇将着重讲解 `Vue`前端工程如何做单元测试。学习一个新技术，必须要清楚两个W，"What && Why"。"XX 是什么？"，"为什么要使用 XX ，或者说 XX 有什么好处"，最后才是"XX 怎么使用"。本文也将从“前端单元测试是什么”、“为什么要做单元测试”进行讨论。

## 前端单元测试是什么?
> 单元测试（unit testing），是指对软件中的最小可测试单元进行检查和验证。对于单元测试中单元的含义，一般来说，要根据实际情况去判定其具体含义，如C语言中单元指一个函数，Java里单元指一个类，图形化的软件中可以指一个窗口或一个菜单等。总的来说，单元就是人为规定的最小的被测功能模块。单元测试是在软件开发过程中要进行的最低级别的测试活动，软件的独立单元将在与程序的其他部分相隔离的情况下进行测试。——百度百科

<!--more-->

作为后端开发者，对于单元测试可能已经很熟悉了。以Java Web开发为例，我们经常使用`Junit`做单元测试。作为传统的后端开发人员，认为前端代码都运行在浏览器里，如何做单元测试？！对于Javascript来讲，当然是可以进行单元测试的，并且也通常是针对函数、模块、对象进行测试。前端单元测试狂阶也有不少，比如`QUnit`、`Sinon`、`Mocha`等等，单元测试的执行环境可以是我们日常使用的浏览器`ie`、`Chrome`等，也可以是无界面浏览器比如`PhantomJS`、`Headless Chrome`。
在前端的世界里，至少需要三类工具来进行单元测试：
* **测试管理工具**

测试管理工具是用来组织和运行整个测试的工具，它能够将测试框架、断言库、测试浏览器、测试代码和被测试代码组织起来，并运行被测试代码进行测试。我们经常使用`Karma`

* **测试框架**

测是框架是单元测试的核心，它提供了单元测试所需的各种API，你可以使用它们来对你的代码进行单元测试。我们使用`Mocha`

* **断言库**

断言库提供了用于描述你的具体测试的API，有了它们你的测试代码便能简单直接，也更为语义化，理想状态下你甚至可以让非开发人员来撰写单元测试。我们使用`sinon-chai`

可选工具包括：

* **测试浏览器**

这个比较好理解，就是测试代码所执行的浏览器环境。我们使用`PhantomJS`或者`Headless Chrome`

* **测试覆盖率统计工具**

我们使用和`Karma`配套的`Karma-coverage`

## 为什么要做前端单元测试?
定义中已经明确指明了单元测试的意义。有些后端工程师仍然停留在“前端只是给客户展示个数据顺便带点交互，没什么复杂逻辑，要什么单元测试”这种思想中。随着互联网的发展，客户体验的提升，前端已经越来越复杂，也随之产生了前端工程化的方法，前端也有了MVC的划分，分工也更加明确。一个单页面应用的复杂度已经非常之高，使用单元测试来保证每个模块每个方法的正确性势在必行。同时，自动化的单元测试也为重构提供了保证。如果你开发的是一个框架，那么你的单元测试覆盖率会给使用者提供更多的信心，会使你的框架更加流行。比如`bfe-ui`的单元测试覆盖率就达到了78%，近期还在进一步提升。
![覆盖率](/resources/vue-tutorial-for-ci/bfe-ui-coverage.png)
## `Vue` 工程的单元测试如何做?
下面着重讲解`Vue`工程如何进行自动化的单元测试。本文讲解的是使用`Vue-cli`或者`bfe-cli`创建的工程如何使用。测试工具默认使用了上文的推荐工具。
首先在`/test/unit/specs/`文件夹中增加一个测试案例文件，命名为`<模块名称>.spec.js`。框架代码会自动扫描以`.spec.js`结尾的文件当做测试案例进行执行。
假设我们有一个这样的组件`MyComponent.vue`:
```html
<template>
  <span class="message">{{ message }}</span>
  <span class="message2">{{ message2 }}</span>
</template>

<script>
  export default {
    props: ['message2'],
    data () {
      return {
        message: 'hello!'
      }
    },
    created () {
      this.message = 'bye!'
    }
  }
</script>
```
这个组件有输入参数message2、有方法、有输出，麻雀虽小五脏俱全，如何做单元测试呢？
```js
// 导入工具方法
import {createTest, destroyVM} from '../util';
import MyComponent from 'path/to/MyComponent.vue'

describe('MyComponment', () => {
  let vm = null;
  // 每个案例执行完成后销毁组件实例
  afterEach(() => {
    destroyVM(vm);
  });
  // 第一个案例，检查组件是否有created方法,has a created是案例名称
  it('has a created', () => {
    expect(typeof MyComponent.created).toBe('function');
  })
  // 检查data设置是否正确
  it('sets the correct default data' () => {
    expect(typeof MyComponent.data).toBe('function')
    const defaultData = MyComponent.data()
    expect(defaultData.message).toBe('hello!')
  })
  // 检查渲染后的组件状态
  it('renders the correct message', () => {
    vm = createTest(MyComponent);
    expect(vm.$el.querySelector('.message').textContent).to.equal('bye!')
  })
  // 检查传参是否正确
  it('renders correctly with different props', () => {
    vm = createTest(MyComponent, {
      message2: 'test1'
    });
    expect(vm.$el.querySelector('.message2').textContent).to.equal('test1')
  })
})
```

测试案例写好了，接下来我们来执行一下
```
$ npm run test

...省略启动信息...

  MyComponment.vue
    ✓ has a created
    ✓ sets the correct default data
    ✓ renders the correct message
    ✓ renders correctly with different props

PhantomJS 2.1.1 (Linux 0.0.0): Executed 4 of 4 SUCCESS (0.193 secs / 0.058 secs)
TOTAL: 4 SUCCESS
```
从结果可以看出，一共4个案例，成功执行4个，测试案例是使用PhantomJS无头浏览器执行的。同时，在`/test/unit/coverage/lcov-report/`文件夹下可以找到测试报告，里面有详细的代码覆盖率情况，可以明确的看出哪些代码没有被测试到。下图为`bfe-ui`的测试报告。
![测试报告](/resources/vue-tutorial-for-ci/bfe-ui-report.png)

结合`Gitlab-CI`可以在工程每一次提交代码时进行一次单元测试，将所有案例自动执行一遍，并且给出测试报告，并将执行结果可视化的反馈在流水线上。

以上就是关于Vue工程如何做单元测试的全部内容。

-EOF-

<!-- indicate-the-source -->