---
title: 【翻译】基于Favicon的超级Cookie
date: 2021-2-25 09:39:58
categories: [技术]
tags: [cookie, favicon, javascript]
---

# 序言
很久以前写过一篇文章[不用Cookie我也能追踪你](/2015/03/09/track-u-without-cookie/),自从得知了文章中的思路以后就感觉脑洞大开，简直黑科技，随着这么多年的发展，文中提到的帆布指纹识别技术已经应用到了很多的实际项目中了，追踪与反追踪本来就是猫鼠游戏，用的多了这种技术也渐渐的被好些个浏览器屏蔽了。最近又看到一种新的追踪思路，由于是英文的，在观摩的时候顺手翻译了出来。

翻译自 https://supercookie.me/workwise
📚 更详细的信息你可以看一下来自Illinois大学的这篇论文。[https://www.cs.uic.edu/~polakis/papers/solomos-ndss21.pdf](https://www.cs.uic.edu/~polakis/papers/solomos-ndss21.pdf)

# 导论

> 数据是新的黄金！

浏览器是人类轻松的访问[万维网](https://en.wikipedia.org/wiki/World_Wide_Web)所使用的最广泛的访问媒介了。

由于互联网的不断发展，得益于新的标准和新的功能，更多的功能强大的API被引入到了浏览器端，再过去的几年里，在浏览器端收集数据和分析数据的可能性被大大扩展了。

首先，收集数据无可厚非。我们每一个人都会收集各种各样的数据，有的是在日常生活中无意的收集，有的是在学校或者工作中有意识的收集。收集数据分析数据并得出有用的结论是非常重要的。

随着面向大众万维网的推出和互联网服务服务的发展，各家服务提供商也开始对收集数据提起了兴趣。有这样一句话叫“如果我拥有一个网站，我就需要知道谁在网上使用它”

但是，在大多数情况下，作为服务使用者的我们只希望能尽量少的泄漏数据，只提供非常必要的数据，因为我们的私人数据和他人无关。

随着上文提到的互联网技术的进一步发展，使得个人信息和数据得以关联起来，从而能够识别辨认某一个客户，并且能够追踪这个客户的浏览活动，即使客户浏览器不同的网页或服务，仍然能够被追踪—这就是所谓的[设备指纹](https://en.wikipedia.org/wiki/Device_fingerprint)。

常见的生成浏览器唯一设备指纹的方式有硬件benckmark，基于Canvas和WebGL的设备指纹或者分析浏览器活跃的扩展插件。

本文介绍的是一种不太为众人所知的方法。

# 背景

现代浏览器提供了很多功能来改善和优化客户体验。其中一种功能就是favicons，favicon是一种小的（通常是16×16或32×32像素）标志，我们可以使用它来方便的识别一个网站。大多数的浏览器将favicons显示在地址栏和书签列表中的页面名称旁边

开发者可以通过在网页头部包含一个`<link rel>`属性来在他们的网站上提供一个favicon。如果存在这个标签，浏览器就会从设定的地址请求这个图标，如果服务器正常响应了这个图标，就可以正常的渲染并显示这个图标。如果没有正常返回，则会显示一个空白的favicon。

```html
<link rel="icon" href="/favicon.ico" type="image/x-icon">
```

为了让浏览器非常容易的访问到favicons，它们会被缓存在系统一个单独的本地数据库中，称为favicon缓存（F-Cache）。F-Cache的数据条目包括访问的URL（子域、域、路由、URL参数）、favicon ID和生存时间（TTL）。

虽然这种设计是为了让网站开发人员可以通过使用不同的图标来划分同一个网站不同部分，比如不同的路由或者不同的子域名可以使用不同的图标，但是这也导致了用户可以被跟踪的可能性。

当用户访问一个网站的时候，浏览器可以通过查找网页的favicon配置来检测是否需要加载favicon。浏览器会首先检查本地的F-cache中是否包含这个网站URL的favicon缓存。如果存在，则图标将从缓存中加载显示。但是如果没有缓存（比如这个URL从来没加载过图标，或者缓存中的数据已经过期），浏览器会向服务器发出GET请求来加载网站的图标。

# 威胁模型

本文提出了一个可能的威胁模型，即使在用户开启了反指纹措施（比如删除cookies、使用VPN、删除浏览器缓存或者修改客户端头信息）的情况下，仍然能够追踪客户。

网站服务器可以得知浏览器是否加载过favicon的信息：

所以当浏览器请求一个网页的时候，如果favicon不在本地F-Cache种就会再次请求favicon，如果图标已经存在于F-Cache中，就不会再发请求。

通过结合浏览器对特定URL是否请求过favicon的状态，可以为客户端分配一个唯一的识别号。当网站被重新加载时，Web服务器可以分析识别号与客户端发送的缺失favicon的请求的关系识别特定的浏览器指纹。

1、记录身份信息
写操作的目的是生成一个唯一的标识，并将其存储在客户端当中。
第一步是在服务器上创建一个新的N比特的ID，将其转化为路径向量，如下面所示。

``` javascript
const N = 4;
const ROUTES = ["/a", "/b", "/c", "/d"];
const ID = generateNewID(); /* -> 1010 • (select unassigned decimal number, here ten: 10 -> 1010b in binary) */

const vector = generateVectorFromID(ID); /* -> ["/a", "/c"] • (because [a, b, c, d] where [1, 0, 1, 0] is 1 -> a, c) */
```

第二步是将实际的数据存储在浏览器中。客户将被依次重定向到网站的所有路径，从/a开始，导航到/b，再到/c最红到/d。

- /a
- /b
- /c
- /d

当访问这些网页的时候，浏览器会为每一个路径请求一个favicon。以同样的方式从/a/favicon.ico，到/b/favicon.ico，到/c/favicon.ico，最后到/d/favicon.ico。

- /a/favicon.ico
- /b/favicon.ico
- /c/favicon.ico
- /d/favicon.ico

现在web服务器只会处理那些存在于路径向量中的路径对应的favicon请求。如果路径存在于路径向量中，web服务器会以favicon文件和状态200来应答。

如果请求的路由不在路径向量中，web服务器就会以错误404来应答favicon请求，或者不返回请求。

上文提到了浏览器只会在F-Cache中存储正常的favicon，相当于我们现在已经存储了我们的唯一识别号，写入过程已经完成了。

在上面的例子中，web服务器只响应了/a/favicon.ico和/c/favicon.ico路径下的favicons请求。F-Cache中只有这两个路径下的favicons信息。

![图片来自https://supercookie.me/assets/diagram-write.png](/resources/supercookie-with-favicon/diagram-write.png)

2、读取身份信息

现在的目标是根据现有的F-Cache条目来重新识别一个返回的用户。

在读取模式下服务器总是以404错误的状态响应favicon请求，但是正常响应所有其他请求。这在读取操作中保持了缓存favicon的完整性，因为浏览器不会在F-Cache中创建新的缓存条目。

为了重建一个用户的标识符，浏览器必须访问所有的可用路由。服务器会记录浏览器会请求哪些页面的favicon（不存在与F-cache中）。

例子：

```javascript
const visitedRoutes = [];
Webserver.onvisit = (route) => visitedRoutes.push(route);  // -> ["/b", "/d"]
Webserver.ondone = () => { const ID = getIDFromVector(visitedRoutes) }; // -> 10 • (because "/a" and "/b" are missing -> 1010b)
```

因此，服务器可以从缺失的favicon请求中重建识别，读取过程就完成了。

![图片来自https://supercookie.me/assets/diagram-read.png](/resources/supercookie-with-favicon/diagram-read.png)

# 目标

看起来所有的顶级浏览器都容易受到这种攻击方案的影响。移动浏览器也受到影响。

| 浏览器 | Windows | MacOS | Linux | iOS | Android | 信息 |
| -- | -- | -- | -- | -- | -- | -- |
| Chrome(v87.0) | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Safari(v14.0) | - | ✅ | - | ✅ | - | - |
| Edge(v87.0) | ✅ | ✅ | ❌ | ❌ | ✅ | - |
| Firefox (v 85.0) | ✅ | ✅ | ❌ | ❌ | ❌ | 在隐身模式下指纹不同 |
| Brave (v 1.19.92) | ❌ | ❌ | ❌ | ❔ | ❌ | - |
| Brave (v 1.14.0) | ✅ | ✅ | ✅ | ✅ | ✅ | - |
| Firefox (< v 84.0) | ✅ | ✅ | ❔ | ❌ | ✅ | - |


该演示还令人印象深刻地表明，应用反跟踪软件、广告拦截器、VPN或在隐身模式下冲浪并不能提供任何显著的改善，即使采取这些措施，浏览器仍然容易受到跟踪。

| 浏览器 | 隐身模式 | 删除网站数据 | VPN | 反跟踪软件或广告拦截器 |
| -- | -- | -- | -- | -- |
| Chrome | ✅ | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ | ✅ |

# 性能和可扩展性

通过改变与子路径重定向数量相对应的比特数，这种攻击几乎可以任意缩放。它可以区分2^N个独特的用户，其中N是客户端的重定向数量。

由于每次子路由的重定向都会增加识别的持续时间，为了提升攻击性能，web服务器可以动态的增加重定向的次数。可以通过在子路径的序列中增加一个新的子路径来完成。

重定向次数（N）可以通过"floor(log2(id))+1”来计算。其中id为十进制标识号。

例如，如果服务器的标识符从3位变成4位，子路由向量将从["/a"、"/b"、"/c"]变为["/a"、"/b"、"/c"、"/d"]，客户端的标识符（这里是十进制的6）从“011”变成“0110”，而不改变已经写入F-cache标识符的实际值。

这样就可以用最少的重定向次数达到攻击的目的。

![图片来自https://supercookie.me/assets/diagram-scalability.png](/resources/supercookie-with-favicon/diagram-scalability.png)

随着可区分的客户端和重定向数量的增加，读写操作所需的时间也会增加。

以下测算的时间被证明是该攻击发挥作用所需的最短时间。实际所需时间取决于更多因素，如网速、位置、硬件设置和浏览器类型。

| 重定向次数(N bit) | 可区分客户机 | 写入时间 | 读取时间 | 尺度信息 |
| -- | -- | -- | -- | -- |
| 2 | 4 | <300ms | <300ms | 一个用户的4个浏览器 |
| 3 | 8 | <300ms | ~300ms | [kardashians](https://cn.bing.com/search?q=who+are+the+kardashians)的数量 |
| 4 | 16 | <1s | ~1s | 一群你的邻居 |
| 8 | 256 | <1s | ~1s  | 你全部Facebook好友的数量 |
| 10 | 1024 | <1.2s | ~1s | 一个小的村庄 |
| 20 | 1048576 | <1.8s | <1.5s | 小城市(加州圣何塞) |
| 24 | 16777216 | <2.4s | <2s | 整个荷兰|
| 32 | 4294967296 | ~3s | <3s | 所有能上网的人 |
| 34 | 17179869184 | ~4s | ~4s | 所有可以上网的人，每人使用4个不同的浏览器。 |

# 引用

- [cs.uic.edu](https://www.cs.uic.edu/~polakis/papers/solomos-ndss21.pdf): Study by Scientists at the University of Illinois, Chicago
- [heise.de](https://heise.de/-5027814): Browser-Fingerprinting: Favicons als "Super-Cookies"