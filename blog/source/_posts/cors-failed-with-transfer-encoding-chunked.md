---
title: "分块传输就不能跨域? `chunked`编码影响`CORS`跨域的问题排查"
date: 2021-05-20 13:37:38
categories: [技术]
tags: [http, transfer-encoding, chunked, CORS]
---

在日常开发中我们经常遇到需要进行跨域的情况，虽然跨域的方案有非常多，但是最推荐的方法还是`CORS`。服务器在`Http`返回头中增加`CORS`的返回信息，就可以轻松的进行跨域。

<!--more-->

## 问题现象

有一个项目，采用了`CORS`进行跨域，项目是基于`Spring`开发的，部署在`Jboss`上，`Apache`为`web`服务器。项目的实现方式是通过增加了一个`CorsFilter`的方式，在每一个请求中添加`CORS`的几个返回头。

```java
package com.bocsoft.bfwDemo;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CorsFilter implements Filter {
    public void destroy() {}

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
   throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        chain.doFilter(req, res);

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Cache-Control","no-cache");
    }

    public void init(FilterConfig filterConfig) throws ServletException {}
}
```

这个项目正常运作了一段时间以后，突然有一天，被测试发现某个获取列表的接口无法正常返回，浏览器`Console`报错“`No ‘Access-Control-Allow-Origin’ header is present on the requested resource`”。而且据测试人员描述，某些账号此处不会报错，只有特定的这个账号才会这样。通过报错可以轻易判定这是CORS返回头没有的错误，但是不同的账号有不同的表现确实非常诡异。

## 分析过程

通过对比正常和报错的两个报文，可以发现异常的报文除了没有`CORS`返回头以外，多了一个`Transfer-Encoding：chunked`

正常的返回如图:

![正常的返回](/resources/cors-failed-with-transfer-encoding-chunked/normal-response.png)

异常的返回如图:

![异常的返回](/resources/cors-failed-with-transfer-encoding-chunked/error-response.png)

通过查阅资料，才知道`Transfer-Encoding:chunked`的触发可能和报文的长度有关，于是通过对比报文长度，有异常的那个账户这笔交易的返回报文确实比较长，所以才会触发了这个问题。

问题的原因虽然找到了，但是有什么办法才能避免这个问题的出现呢？总不能限制报文的最大长度吧。在搜索引擎上搜索也没有找到相同的问题，只有在Stack Overflow上找到了一个相同的疑问，但是7年了也没有人解答。

于是我们开始进行Debug，把断点设置在`CorsFilter`上，无论是正常返回的还是异常返回的都正常的进入了`CorsFilter`并且正常执行了`setHeader`语句。这就奇怪了，难道我们设置的`header`被覆盖了？直到我在网上看到了这么一段话“`response`的`header`设置，要在缓冲区装入响应内容之前，`http`的协议是按照响应状态、各响应头和响应正文的顺序输出的，后写入的`header`就不生效了。”结合`Transfer-Encoding:chunked`分块传输的特性，也许真的是因为我们写入`header`的时机晚了。

于是我又`Debug`进入了`CorsFilter`里，尝试去看`response`里`header`的情况（在`response-coyoteResponse-headers`），正常的返回在我们设置`header`之前，这个`headers`是空的，如图。

![header是空的](/resources/cors-failed-with-transfer-encoding-chunked/empty-header.png)

后续每次执行`setHeader`语句都会改变`headers`的值。

![headers改变](/resources/cors-failed-with-transfer-encoding-chunked/change.gif)

当我`Debug`异常的返回的时候，我发现在执行`setHeader`之前`response`里的`header`就已经存在`Transfer-Encoding:chunked`值了，见图

![header是有值的](/resources/cors-failed-with-transfer-encoding-chunked/noempty-header.png)

当我们执行`setHeader`语句的时候，`headers`的值居然不会变！

![headers不改变](/resources/cors-failed-with-transfer-encoding-chunked/not-change.gif)

看来验证了我们之前的假设，在这种情况下，在执行`setHeader`语句的时候，`http`的缓冲区已经写入了。根本原因找到了，解决方法也就显而易见了。

## 解决方法

我们只要在写入缓冲区之前就写入`header`就可以解决这个问题了，所以我修改了`CorsFilter`的代码，把`setHeader`放到`chain.doFilter`之前就可以了。

```java
 public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
   throws IOException, ServletException {

    HttpServletRequest req = (HttpServletRequest) request;
    HttpServletResponse res = (HttpServletResponse) response;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Cache-Control","no-cache");
 
    chain.doFilter(req, res);
  
 }
```

我们再测试一下，返回报文正常了，在出现`Transfer-Encoding:chunked`的同时也有`CORS`返回头了

![正常的CORS](/resources/cors-failed-with-transfer-encoding-chunked/normal-cors.png)

## 后记

接下来解释几个问题

1. 关于缓冲区
   `Servlet`程序输出`http`消息的时候，响应正文首先被写入到`servlet`引擎提供的一个缓冲区内，直到缓冲区被填满或者所有内容都写完了，缓冲区内容才会被`Servlet`发送给客户端。使用输出缓冲区后，`servlet`就可以将响应状态、各响应头、响应正文严格按照`HTTP`消息的位置顺序调整后在输出到客户端。如果发送响应到客户端的时候，输出缓冲区已经装入了所有内容，则`Servlet`会计算响应大小并自动设置`Content-Length`。如果输出缓冲区装入的内容只是响应内容的一部分，则`Servlet`会使用`HTTP1.1`的`chunked`编码方式（通过设置`Transfer-Encoding：chunked`）传输制定的内容。

2. 什么是`TransferEncoding`
   通过HTTP传输数据的时候，有些时候并不能事先确定body的长度，因此无法得知`Content-length`的值，就不能在`header`中指定`content-length`的大小了，接收方也就无法获知报文的长度，那么怎么判断发送完毕了呢？`HTTP1.1`协议在`header`中引入了`Transfer-Encoding`，当其值为`chunked`的时候表明采用`chunked`编码方式进行报文提传输。`chunked`编码方式为每一个分块单独标记长度，直到出现长度为0的块的时候表明传输结束。

3. 什么是`CORS`
   `CORS`是一个W3C的标准，全程是跨域资源共享（`Cross-origin resource sharing`）。它允许浏览器向跨源服务器发出`XHR`请求，从而克服`Ajax`只能同源使用的限制。它需要浏览器和服务器同时支持才能完成跨域。`CORS`通信在`Ajax`请求返回头中添加了几个特定的返回头（`Access-Control-Allow-Origin`，`Access-Control-Allow-Methods`等），浏览器根据返回头中的信息按照规则开放跨源访问。

4. 为什么要在应用上增加`CORS`头而不是在`Apache`上
   `Apache`或者是`Jboss`都可以在配置文件中增加`CORS`返回头配置，但是，都不够灵活。例子代码中只是最简单的情况，真实情况是是否返回`CORS`头，或者`CORS`头的具体内容需要根据`request`动态调整，这样在配置文件上就无法实现了，在应用中实现`CORS`返回头的配置就会比较灵活。

