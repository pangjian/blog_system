title: JSON与Java对象的事
date: 2015-09-12 13:11:33
categories: [技术]
tags: [json,java,jackson]
photos:
- /resources/json-and-java-object/JSON.png
thumbnail: /resources/json-and-java-object/JSON.png
cover: /resources/json-and-java-object/JSON.png
---

很久没有写了，来清理一下杂草。这片文字是团队内其他小伙伴经常混淆的一个知识点，最初的目的是写个东西好让大家用到的时候可查，由于原文涉及公司的一个框架，不便写出来。该框架其实引用的开源框架Jackson，所以本文直接介绍Jackson部分。其实说不上介绍，约等于一个学习笔记。
<!--more-->


## JSON是什么？
JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。它基于JavaScript（Standard ECMA-262 3rd Edition - December 1999）的一个子集。JSON采用完全独立于语言的文本格式，但是也使用了类似于C语言家族的习惯（包括C、C++、C#、Java、JavaScript、Perl、Python等）。这些特性使JSON成为理想的数据交换语言。易于人阅读和编写，同时也易于机器解析和生成。

### JSON的值可以是
* 数字number（整数获浮点数）
![number](/resources/json-and-java-object/number.PNG)
* 字符串string（在双引号获单引号中）
![string](/resources/json-and-java-object/string.PNG)
* 逻辑值boolean（true获false）
* 数组array（在方括号中）
![array](/resources/json-and-java-object/array.PNG)
* 对象object（在花括号中）
![object](/resources/json-and-java-object/object.PNG)
* 函数function
* null

所以说String、BigDecimal、List、Map、Integer都不是JSON的值，这些只是java中的类，在JavaScript中是不存在的。（作为Java开发者，不能手里拿着锤子就看什么都是钉子）

## JSON示例
```JavaScript
{
    "number":1234,
    "number2":12.34,
    "numString":"1234",
    "numString2":"12.34",
    "string":"abc",
    "object":{"p1":"abc"},
    "array":["a","b"],
    "boolean":true
}
```

## Jackson
## Java与JSON的映射关系（基于Jackson）
## 代码及运行结果

* "number":1234
<!-- indicate-the-source -->
