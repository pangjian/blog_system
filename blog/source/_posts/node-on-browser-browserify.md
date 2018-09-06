title: javascript前后端代码复用-browserify
date: 2015-11-18 09:36:11
tags: [Nodejs,javascript,browserify]
photos:
- /resources/node-on-browser-browserify/browserify.png
thumbnail: /resources/node-on-browser-browserify/browserify.png
---
Nodejs将javascript带上了一个新的高度，让之运行于浏览器端的javascript可以运行在服务器端。但是Nodejs遵循Commonjs规范，不能直接运行在浏览器端。虽然是同一种语言，但是前后端有着自己的库，不能复用真是一种浪费。
这时候一个神器出现了，[Browserify](http://browserify.org/)。通过预编译，可以将Commonjs规范的后端Nodejs代码直接可以运行在浏览器端。打通了端后端代码复用的壁垒，为nodejs程序开辟了一片新天地。

<!--more-->

# 背景
[前面一片博客](http://www.pangjian.info/2015/09/15/recent-thinking-2015-09/)提到了我需要一种前端解析Velocity模板的方法，终于找到一个好的方法。苦于代码是基于Nodejs的，readme中提示可以使用spm打包后使用，试了好多次都没有成功。无意间在知乎上发现了Browserify。顺利满足需求，下一篇博客就会写这部分内容。

# Browserify安装
就像封面图片上那样，使用npm全局安装。

```shell
$ npm install -g browserify
```
# Browser使用
## 参数说明
官方说明如下，部分选项做了翻译
```shell
Usage: browserify [entry files] {OPTIONS}

Standard Options:

    --outfile, -o  browserify日志打印到文件
    --require, -r  绑定模块名或文件，用逗号分隔
    --entry, -e  应用程序的入口
    --ignore, -i  Replace a file with an empty stub. Files can be globs.
    --exclude, -u  Omit a file from the output bundle. Files can be globs.从其他绑定引入文件
    --external, -x  Reference a file from another bundle. Files can be globs.
    --transform, -t  Use a transform module on top-level files.
    --command, -c  Use a transform command on top-level files.
    --standalone -s  Generate a UMD bundle for the supplied export name.
                   This bundle works with other module systems and sets the name
                   given as a window global if no module system is found.
    --debug -d  Enable source maps that allow you to debug your files separately.
              激活source maps调试文件
    --help, -h  Show this message 帮助
```

## 示例
编写Nodejs服务端脚本，outputName.js，index.js
```javascript
module.exports = function(name){
    console.log('Hello '+name);
}
```

```javascript
var outputname = require('./outputName.js');
outputname('pangjian');
```
在Nodejs环境下运行结果如下：
![Nodejs环境下运行结果](/resources/node-on-browser-browserify/nodeResult.png)

使用browserify预编译一下
```shell
$ browserify index.js > bundle.js
```
之后你就可以直接在浏览器中这样使用：
```html
<script src="bundle.js"></script>
```
查看浏览器端运行结果：
![浏览器端运行结果](/resources/node-on-browser-browserify/browserResult.png)

当然，你肯定不能满足于将所有脚本全部打包成一个js文件，仅仅在`script`标签上引用进来。你需要的也许是将某个模块打包，然后在浏览器的js中使用`require(module)`来调用这个模块，这也正是我需要的。那么你需要在执行预编译的时候加上`-r`参数即可。

```shell
$ browserify -r outputName.js:ouputname > bundle.js
```
冒号后面是你指定的模块名称，这样你就可以在script标签中这么使用：
```html
<script>
	var outputname = require('ouputname');
	outputname('pangjian');
</script>
```
好了，大功告成，接下来就是发挥你想象的时间。
<!-- indicate-the-source -->
