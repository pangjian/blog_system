title: 使用Pjax优化你的网站
categories: [技术]
tags:
  - javascript
  - nprogress
  - pjax
photos:
  - '/resources/pjax-your-blog/pjax.png'
thumbnail: '/resources/pjax-your-blog/pjax.png'
date: 2015-12-03 12:32:00
---
Ajax（Asynchronous Javascript and XML）的魅力在于它的每一个成员都不是新技术，经过奇妙的结合却掀起了WEB2.0的革命。`Pjax`是`pushState`和`ajax`的封装，同样每一个都算不上新技术，结合起来却有着神奇的效果。

<!--more-->
前两天在闲逛别人博客的时候，无意间发现了有个人的博客访问速度极快，于是乎好奇研究了一下。在查看代码的时候发现了一个`jquery.pjax.min.js`。上网查了查资料，这确实是速度快的原因。
`Pjax`的主要原理是利用`ajax`异步请求页面并局部刷新，利用`pushState`修改url和history，这样就既拥有了`ajax`局部刷新的优势，同时也避免了只利用`ajax`的单页面应用url不会变化，不利于SEO，还避免了浏览器的前进后退也失效的问题。[github](http://www.github.io)、Google+都在使用这样的技术。除了以上的优点以外，页面切换浏览器不会白屏，还能添加自己的过度动画这点也着实很有吸引力。非常适用于静态博客这种每次页面切换基本只有主体内容会变化的情况。

本文的内容旨在记录本博客引入pjax的过程，效果可以参考[本博客](http://www.pangjian.info)。本文讲解的引入过程特指jQuery插件版，可以查看github上的[jquery-pjax](https://github.com/defunkt/jquery-pjax)。

# 效果
不看广告，先看疗效。引入pjax前切换一次页面的请求
![引入pjax前](/resources/using-pjax/pajax_before.png)

引入pjax后...
![引入pjax后](/resources/using-pjax/pjax_after.png)
效果还是很明显的，请求减少到了3次，大量已经引入的资源文件由于没有刷新，没有重复请求。速度也大大提升了。

# 安装
非常简单，只需要引入jQuery和jquery-pjax的js即可。这里不再赘述。

# 使用
```javascript
$(document).pjax(selector, [container], options)
```
* `selector`是一个选择器，用来代理点击事件，触发pjax。
* `container`是pjax后需要被替换的部分
* `options`是参数
## 参数
参数中支持设置超时时间，http请求方式等，这里只介绍两个我用到的。其他参数可以在github上[jquery-pjax](https://github.com/defunkt/jquery-pjax)查看。
### `timeout`
`timeout`是pjax的超时事件，timeout时间以后就会触发一次完整的页面刷新。默认的650ms太短了，经常会触发刷新。所以我把它设的大了一点。
### `fragment`
`fragment`，如果你的网站也没有后端支持，每次pjax请求仍然会返回完整的页面的话你就需要这个参数了。他同样是一个选择器，在完整的返回页面中选出需要替换的内容，将不需要刷新的部分过滤掉。也就是说，新返回的页面的`fragment`部分会替换掉当前页面的`container`部分。

下段代码是这个博客的使用片段：
```Javascript
$(document).pjax('a', '#main', { fragment: ('#main'), timeout: 10000 });
```
## 事件
pjax支持事件回调函数，用来定制一些动作。这里也只介绍这个博客在使用的，其他可以在github上[jquery-pjax](https://github.com/defunkt/jquery-pjax)查看。
### `pjax:click`
当`selector`被点击时触发，我将开始转场动画的方法`NProgress.start()`放到了这个事件上。
### `pjax:start`
顾名思义pjax开始事件
### `pjax:end`
顾名思义pjax结束事件，我将动画的结束方法放到了这个事件上。`NProgress.done()`,同时，由于页面上的局部刷新了，原先绑定在这部分内容上的事件都失效了，我也在这个事件上增加了一个方法，重新绑定了一些事件，很重要的部分就是将多说显示出来，另外替换博客访问量的计数器，访问计数器数值也应该加1。

# 原理简述
### `pushState`
`pushState`是HTML的新增Api。用来改变当前页面的URL而不刷新页面。使用方法如下：
```javascript
window.history.pushState(state, title, url);
```
`state`用来配合`popstate`创建历史，`title`为标题，`url`为要替换的地址。此处应注意两点，`pushState`并不能改变标题，`url`只能替换同域名的url。

### `ajax`与`pushState`结合
请参考下面伪代码,它实现了简单的`pjax`
```javascript
$("a").click(function(e){
  e.preventDefault();
  var target_url = $(this).attr('href');
  loadTarget(target_url,function(ret){
   document.title=ret.title; // 更换新的页面标题
   if(history.pushState){
     var state = ({
       url:target_url,
       title:ret.title
     });
     window.history.pushState(state, ret.title, target_url)
   }
 });//使用ajax获取目标页面，成功调用回调函数
});
```
# 附录
这个博客的转场动画使用的[NProgress](http://ricostacruz.com/nprogress/)。类似Youtube上的红色激光。使用起来也很加单。我自己玩了很久...
![NProgress](/resources/using-pjax/NProgress.png)
<!-- indicate-the-source -->
