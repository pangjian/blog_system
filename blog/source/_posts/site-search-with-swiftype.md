title: 使用Swiftype为静态博客添加站内搜索
date: 2015-03-24 21:35:58
tags: [技术,site search,swiftype,hexo]
photos:
- /resources/site-search-with-swiftype/swiftype.png
thumbnail: /resources/site-search-with-swiftype/swiftype.png
---
>为网站、App提供站内搜索的Swiftype获1300万美元B轮融资。Swiftype可以为网站及移动App提供内置搜索引擎服务，搜索服务的部署非常简单，只需要插入一行JS代码即可搞定。于Google相比，高度可定制化是它的优势。
来自：36Kr

<!--more-->

之前一直用的默认的百度搜索，由于某种问题一直效果不理想。Google又被墙了（无法访问），也没法使用。在微博上看到文章开头这个新闻，突然有了拿来用的想法。

## 效果展示
点击本站右上角的搜索图标，在弹出的模态窗口中输入你想要搜索的内容。怎么样，Swiftype真是“天生异禀，骨骼惊奇”。自动补全、实时展示搜索结果，搜索结果还有缩略图展示。
如图：
![搜索结果](/resources/site-search-with-swiftype/searchresult.PNG)

## 实现步骤：
#### 申请Swiftype账号
进入[Swiftype官网](https://swiftype.com)，注册一个免费账号。然后按照引导将你的网址输入给Swiftype，Swiftype就会自动抓取站点的所有页面。
#### 将搜索框安装到网站
切换到install标签，如图：
![install面板](/resources/site-search-with-swiftype/install.PNG)
按照你喜欢的方式选择搜索页面出现的方式。我选择的直接将搜索结果展示在本页的模态窗口上。点击获取代码，你会得到一段js代码。将这段代码安装在你网站的任意位置即可，剩下的就交给Swiftype去做吧。它会自动创建一个搜索按钮，点击一下，就能出现搜索页面，动画效果也很漂亮。
**但是，如果我们不喜欢那个在右下角丑丑的搜索按钮怎么办？**
因为我的网站有自己的搜索按钮，直接用这个现成的不是很好？我为这个问题可是被折磨了一下午。最后发现解决办法是那么的简单..
将你的搜索按钮增加一个`class`,值为`st-search-launcher`
我的代码如下：
```html
<a id="nav-search-btn" class="nav-icon st-search-launcher" title="Search"></a>
```
就这样，自动添加的搜索按钮没有了，点一下网站自己的搜索按钮，弹出了搜索窗口。大功告成！

#### 优化搜索结果
在rankings标签可以对你的搜索结果进行管理。比如排序、删除某些搜索结果、增加一个特定的搜索结果等等，自定义空间很大。
![管理搜索结果](/resources/site-search-with-swiftype/manageresult.PNG)
#### 为搜索结果添加缩略图
能为搜索结果添加缩略图当然很炫。怎么做呢？也很简单！Swiftype的文档上说只需要在页面的header中添加一个`meta`标签就可以。
```html
<meta property="st:image" content="图片url">
```
以Hexo为例，在`head.ejs`中增加这样一段代码
```html
<% if (page.photos && page.photos.length){ %>
  <meta property="st:image" content="<%- url_for(page.photos[0]) %>">
<% } %>
```
意思就是，如果文章中有photos（就是展示在文章头部的fancybox），就在html中添加meta标签，于fancybox使用一样的图片，如果fancybox有多个图片，那么就是用第一张。这样在使用`hexo d`生成博客的时候，就会自动在每一个包含fancybox的文章页面上加入这个`meta`标签，Swiftype就会为这片文章的搜索结果显示缩略图。

就这样，你的站内搜索就已经完成。如果有其他更好的玩法，欢迎留言讨论。
<!-- indicate-the-source -->
