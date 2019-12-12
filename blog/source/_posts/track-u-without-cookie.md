title: 不用cookie我也能追踪你！
date: 2015-03-09 09:30:10
categories: [技术]
tags: [技术,cookie,html5,canvas,javascript]
photos:
- /resources/track-u-without-cookie/cookie.png
thumbnail: /resources/track-u-without-cookie/cookie.png
cover: /resources/track-u-without-cookie/cookie.png
---

抱歉起了这么个“吸引人的”标题，但我不是标题党。最近由于工作上的一些事情，涉及到识别、追踪设备的项目来了几个，从一篇论文《The Web Never Forgets》无意间又发现了这个技术。查阅了一些资料。做了个小Demo应用到了本博客上。对！你没听错，本页面在追踪你。不过也没那么可怕。看看本站的Visitor Info模块，它可能在屏幕右侧也可能在最底下。这个模块会知道你是否之前访问过本站，并且结合了上一篇博文[基于Firebase的Hexo博客实时访问数统计](http://pangjian.info/2015/02/27/realtime-count-firebase/)中提到的访问数统计，做到了记录每一位访问者的访问次数。即使你关闭了cookie。^ _ ^
<!--more-->
## 原理
这个技术的原理是这样的，网站使用了一个HTML5的标签`canvas`。在绘制canvas的时候，不同的机器、平台、浏览器绘制出的图片在哈希层面是不同且独一无二的，利用这个特性可以追踪这个用户。
技术原理是这样的，但是为什么每一个设备、浏览器绘制的图像是不同的我不太清楚，有兴趣可以参考文章最后的链接。

## 实现
首先绘制一个`canvas`
```javascript
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var txt = 'http://pangjian.info';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial";
        ctx.textBaseline = "pangjian";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);
```

然后通过`canvas.toDataURL()`获取图片的base64编码，png图片被划分成很多块，每块的最后32bit数据是crc校验值，提取出这个值就可以用来当做浏览器指纹。
```javascript
        var b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
        var bin = atob(b64);
        var crc = _t.bin2hex(bin.slice(-16, -12));
```

字节转换成16进制方法
```javascript
    bin2hex: function(s) {
        var i, l, o = '',
            n;
        s += '';
        for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i).toString(16);
            o += n.length < 2 ? '0' + n : n;
        }
        return o;
    }
```

当然你查看本页的源代码可以看到一个文件-`canvasFringerprint.js`。那是完整代码。
我提取出这个指纹以后，在Firebase上为每一个指纹设置了一个计数器，这样就实现了为每一位访问者记录访问次数。
效果如下：
![visitor counter](/resources/track-u-without-cookie/visitor_counter.png)
你可以试试开启浏览器的隐身模式，或者删除全部cookie。再刷新一下这个页面，看看是不是他还记得你？

## 链接
[https://securehomes.esat.kuleuven.be/~gacar/persistent/the_web_never_forgets.pdf](https://securehomes.esat.kuleuven.be/~gacar/persistent/the_web_never_forgets.pdf)
[https://www.browserleaks.com/canvas#how-does-it-work](https://www.browserleaks.com/canvas#how-does-it-work)
<!-- indicate-the-source -->
