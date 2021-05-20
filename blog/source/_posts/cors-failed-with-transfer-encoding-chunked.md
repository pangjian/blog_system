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

这个项目正常运作了一段时间以后，突然有一天，被测试发现某个获取列表的接口无法正常返回，浏览器Console报错“No ‘Access-Control-Allow-Origin’ header is present on the requested resource”。而且据测试人员描述，某些账号此处不会报错，只有特定的这个账号才会这样。通过报错可以轻易判定这是CORS返回头没有的错误，但是不同的账号有不同的表现确实非常诡异。

## 分析过程

通过对比正常和报错的两个报文，可以发现异常的报文除了没有CORS返回头以外，多了一个Transfer-Encoding：chunked

正常的返回如图:

![正常的返回](/resources/cors-failed-with-transfer-encoding-chunked/normal-response.png)

异常的返回如图:

![异常的返回](/resources/cors-failed-with-transfer-encoding-chunked/error-response.png)

通过查阅资料，才知道Transfer-Encoding:chunked的触发可能和报文的长度有关，于是通过对比报文长度，有异常的那个账户这笔交易的返回报文确实比较长，所以才会触发了这个问题。

问题的原因虽然找到了，但是有什么办法才能避免这个问题的出现呢？总不能限制报文的最大长度吧。在搜索引擎上搜索也没有找到相同的问题，只有在Stack Overflow上找到了一个相同的疑问，但是7年了也没有人解答。

于是我们开始进行Debug，把断点设置在CorsFilter上，无论是正常返回的还是异常返回的都正常的进入了CorsFilter并且正常执行了setHeader语句。这就奇怪了，难道我们设置的header被覆盖了？直到我在网上看到了这么一段话“response的header设置，要在缓冲区装入响应内容之前，http的协议是按照响应状态、各响应头和响应正文的顺序输出的，后写入的header就不生效了。”结合Transfer-Encoding:chunked分块传输的特性，也许真的是因为我们写入header的时机晚了。

于是我又Debug进入了CorsFilter里，尝试去看response里header的情况（在response-coyoteResponse-headers），正常的返回在我们设置header之前，这个headers是空的，如图。

![header是空的](/resources/cors-failed-with-transfer-encoding-chunked/empty-header.png)

后续每次执行setHeader语句都会改变headers的值。

![headers改变](/resources/cors-failed-with-transfer-encoding-chunked/change.gif)

当我Debug异常的返回的时候，我发现在执行setHeader之前response里的header就已经存在Transfer-Encoding:chunked值了，见图

![header是有值的](/resources/cors-failed-with-transfer-encoding-chunked/noempty-header.png)

当我们执行setHeader语句的时候，headers的值居然不会变！

![headers不改变](/resources/cors-failed-with-transfer-encoding-chunked/not-change.gif)

看来验证了我们之前的假设，在这种情况下，在执行setHeader语句的时候，http的缓冲区已经写入了。根本原因找到了，解决方法也就显而易见了。

## 解决方法

我们只要在写入缓冲区之前就写入header就可以解决这个问题了，所以我修改了CorsFilter的代码，把setHeader放到chain.doFilter之前就可以了。

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

我们再测试一下，返回报文正常了，在出现Transfer-Encoding:chunked的同时也有CORS返回头了

![正常的CORS](/resources/cors-failed-with-transfer-encoding-chunked/normal-cors.png)

## 后记

接下来解释几个问题

1. 关于缓冲区
   Servlet程序输出http消息的时候，响应正文首先被写入到servlet引擎提供的一个缓冲区内，直到缓冲区被填满或者所有内容都写完了，缓冲区内容才会被Servlet发送给客户端。使用输出缓冲区后，servlet就可以将响应状态、各响应头、响应正文严格按照HTTP消息的位置顺序调整后在输出到客户端。如果发送响应到客户端的时候，输出缓冲区已经装入了所有内容，则Servlet会计算响应大小并自动设置Content-Length。如果输出缓冲区装入的内容只是响应内容的一部分，则Servlet会使用HTTP1.1的chunked编码方式（通过设置Transfer-Encoding：chunked）传输制定的内容。

2. 什么是TransferEncoding
   通过HTTP传输数据的时候，有些时候并不能事先确定body的长度，因此无法得知Content-length的值，就不能在header中指定content-length的大小了，接收方也就无法获知报文的长度，那么怎么判断发送完毕了呢？HTTP1.1协议在header中引入了Transfer-Encoding，当其值为chunked的时候表明采用chunked编码方式进行报文提传输。chunked编码方式为每一个分块单独标记长度，直到出现长度为0的块的时候表明传输结束。

3. 什么是CORS
   CORS是一个W3C的标准，全程是跨域资源共享（Cross-origin resource sharing）。它允许浏览器向跨源服务器发出XHR请求，从而克服Ajax只能同源使用的限制。它需要浏览器和服务器同时支持才能完成跨域。CORS通信在Ajax请求返回头中添加了几个特定的返回头（Access-Control-Allow-Origin，Access-Control-Allow-Methods等），浏览器根据返回头中的信息按照规则开放跨源访问。

4. 为什么要在应用上增加CORS头而不是在Apache上
   Apache或者是Jboss都可以在配置文件中增加CORS返回头配置，但是，都不够灵活。例子代码中只是最简单的情况，真实情况是是否返回CORS头，或者CORS头的具体内容需要根据request动态调整，这样在配置文件上就无法实现了，在应用中实现CORS返回头的配置就会比较灵活。

