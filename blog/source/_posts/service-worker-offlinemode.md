title: 迈向PWA！利用serviceworker的离线访问模式
date: 2017-02-08 08:02:10
categories: [技术]
tags: [javascript,ServiceWorker,PWA]
photos:
- /resources/service-worker-offlinemode/yuanli.png
thumbnail: /resources/service-worker-offlinemode/yuanli.png
---
微信小程序来了，可以利用WEB技术在微信打造一个有着Native应用体验的应用，业界非常看好这种形式。但是你们也许不知道，Google早已有类似的规划，甚至层次更高。那就是PWA（渐进式增强WEB应用）。
PWA有以下几种特性：
- Installablity（可安装性）
- App Shell
- Offline（离线能力）
- Re-engageable（推送通知能力）

所有这些特性都是“优雅降级、渐进增强的”，给支持的设备更好的体验，不支持的设备也不会更差。这就和微信小程序这种二流设计的根本不同之处。
<!--more-->

本博客也在向着PWA的方向迈进，第一步我选择了Offline，也就是离线能力。可以让客户在没有网络连接的时候仍然可以使用部分服务。这个能力利用了Service Worker技术。

实现思路就是，利用service worker，另起一个线程，用来监听所有网络请求，讲已经请求过的数据放入cache，在断网的情况下，直接取用cache里面的资源。为请求过的页面和图片，展示一个默认值。当有网络的时候，再重新从服务器更新。
![原理图](/resources/service-worker-offlinemode/yuanli.png)
代码这里就不贴了，以后可能会专门写一篇来详细介绍Service Worker，有兴趣的可以直接参考[源码](https://www.pangjian.me/sw.js)。
注册起来也非常方便
```javascript
// ServiceWorker_js
(function() {
    'use strict';
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });

})();
```
这里需要注意的是，`sw.js`所在的目录要高于它的控制范围，也就是`scope`。我把`sw.js`放在了根目录来控制整个目录。

接下来看看我们的最终效果吧，你也可以在自己的浏览器下断网尝试一下。当然有部分浏览器目前还不支持，比如大名鼎鼎的Safari。
### 离线有缓存情况

![离线有缓存情况](/resources/service-worker-offlinemode/offline.png)

### 离线无缓存情况
会展示一个默认的页面

![离线无缓存情况](/resources/service-worker-offlinemode/offlinenocache.png)

-EOF-

<!-- indicate-the-source -->
