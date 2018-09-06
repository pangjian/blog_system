title: IHS、Apache、Ngnix 的负载均衡和session亲和配置探究（一）
date: 2018-09-03 12:09:38
tags: [IHS, Apache]
---

最近机缘巧合研究了一下各个Web服务器负载均衡时 Session 亲和性的配置，记录和分享一下。网上已经有一些零散的资料了，但是有很多已经年代久远，很多信息已经不适用了。另外 IHS 的配置是与 IBM 的 WebSphere 的工程师聊过的，应该算是比较准确了。

<!--more-->

## 什么是 Session 亲和
HTTP 协议是一种无状态的协议，但是为了满足需求，需要在HTTP协议上增加一些状态，比如来保存登录用户信息。所以业界普遍使用 Cookie 与 Session 配合的方式保存用户状态。这种模式在一台应用服务器的时候相当完美。但是随着性能压力增大，增加后台服务器数量的时候，就会出现问题。因为 Session 是存储在服务器内存里的，如果负载均衡服务器把用户请求分发给不同的服务器，那么另一台服务器就不存在上一个请求的 Session 信息，导致状态保存失效。
Session 亲和就是为了解决这个问题。负载均衡器为了保持 Session ，把同一个 Session 的请求始终分发给一个应用服务器。市面上的 Web Server 有很多，比如 IBM Http Server（后文简称IHS）、Apache、Nginx、Caddy 等等。

## Apache
### 环境信息
* Apache 2.4 端口 `80`
* Tomcat 8.0 端口 `8080`
* Tomcat 8.0 端口 `9080`

### 过程
选取 Apache 2.4 作为前端 Web Server 负载均衡服务器，后端选取2个 Tomcat 8.0 实例。同一个 Session 的请求只发送到一个 Tomcat 上。
首先在`httpd.conf`文件里加载我们要使用的模块
```
LoadModule lbmethod_byrequests_module modules/mod_lbmethod_byrequests.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_ajp_module modules/mod_proxy_ajp.so
LoadModule proxy_balancer_module modules/mod_proxy_balancer.so
LoadModule proxy_ftp_module modules/mod_proxy_ftp.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_http2_module modules/mod_proxy_http2.so
LoadModule slotmem_shm_module modules/mod_slotmem_shm.so
```
增加一个负载均衡的配置
```
<Proxy balancer://testBalancer>
    BalancerMember http://127.0.0.1:8080/bfwDemo/ 
    BalancerMember http://127.0.0.1:9080/bfwDemo/
</Proxy>

ProxyPass /bfwDemo/ balancer://testBalancer/
ProxyPassReverse /bfwDemo/ balancer://testBalancer/
```
这时再访问`http://127.0.0.1:80/bfwDemo/` Apache 已经将请求分别负载到两个 Tomcat 上了，但是分发是随机的，并不能做到 Session 亲和。Session 亲和需要使用 Tomcat 的 jvmRoute。
在 Tomcat 的 server.xml 配置文件中设置 jvmRoute
```xml
<!-- Define the top level container in our container hierarchy -->
    <Engine name="Catalina" defaultHost="localhost" jvmRoute="jvm1">
```

同时在 Apache 的配置文件中配置jvmRoute的分发规则, route 要和 tomcat 的 jvmRoute 配置对应

```
<Proxy balancer://testBalancer>
    BalancerMember http://127.0.0.1:8080/bfwDemo/  route=jvm1
    BalancerMember http://127.0.0.1:9080/bfwDemo/  route=jvm2
</Proxy>
```
配置完成后，抓取http请求，SessionId变成了这个样子, 使用`.`分割，后面后缀上jvmRoute。
```
Set-Cookie: JSESSIONID=AC7EF1CAA8C6B0FEB68E77D7D375E2AF.jvm1;
```
这样 Apache 就会把对应的请求，分发到指定的 Tomcat 上，就可以做到 Session 亲和了。

### 常见问题
1. Spring Boot 等内嵌的 Tomcat 如何设置 jvmRoute。
   如果你使用的是 Spring Boot 内嵌的 Tomcat，需要按照 Stack Overflow 的方法设置 jvmRoute 的值
   [Set jvmRoute in spring boot 2.0.0](https://stackoverflow.com/questions/49621813/set-jvmroute-in-spring-boot-2-0-0)
2. 使用 Spring Session 之后，设置的 jvmRoute 失效的问题。
   由于还不知道的原因，当应用使用了Spring Session之后， SessionId 的生命周期由 Spring Session 框架接管，默认的 Cookie 值是 SESSION，jvmRoute 添加后失效。可以通过如下方法设置 Cookie 的 name 和 jvmRoute。新增一个这样的 Bean
   ```xml
   <bean class="org.springframework.session.web.http.DefaultCookieSerializer" p:cookieName="JSESSIONID" p:jvmRoute="jvm1"></bean>
   ```
   亲测有效。

## IBM Http Server
IBM Http Server 是 WebSphere 的内置 Web 服务器，基于 Apache 再开发的。理论上Apache的方式IHS也是支持的，但是我没有试过。可见一个文档[Working with a remote IBM HTTP Server (IHS) --Engaging load balancing and failover](http://publib.dhe.ibm.com/wasce/V3.0.0/en/working-with-a-http-server.html)。 这里想说的是使用 WebSphere 自己的方式做 Session亲和。
### 环境
WebSphere Application Server 8.5.5.8

### 说明
关于在 WAS 上安装应用的过程不是本文关注的内容，在此不再赘述。由于Session 亲和默认是启用的，所以也不再讲开启方法。讲讲大概原理好了。
IHS 是通过一种叫做 plugin 的方式与应用服务器进行连接的。可以在WAS控制台生成这个插件（plugin.xml）。
![集群连接](/resources/stick-session-http-server/1.jpg)
每个 WebSphere Application Server 都有自己的 clone ID，这些 clone ID 被记录在 plugin-cfg.xml 中。
```xml
<? xml version="1.0" encoding="ISO-8859-1"?> 
 <Config ASDisableNagle="false" IISDisableNagle="false"
 IgnoreDNSFailures="false" RefreshInterval="60" ResponseChunkSize="64"
 AcceptAllContent="false" IISPluginPriority="High" FIPSEnable="false"
 AppServerPortPreference="HostHeader" VHostMatchingCompat="false"
 ChunkedResponse="false"> 
 ...
 <ServerCluster  CloneSeparatorChange="false" LoadBalance="Round Robin"
 PostBufferSize="64" IgnoreAffinityRequests="true" PostSizeLimit="-1"
  RemoveSpecialHeaders="true" RetryInterval="60"> 
 <Server CloneID="13u6hqmf8" ConnectTimeout="0" ExtendedHandshake="false"
 ServerIOTimeout="0" LoadBalanceWeight="2" MaxConnections="-1"
  WaitForContinue="false"> 
 <Transport Hostname="was7host01" Port="9080" Protocol="http" /> 
 <Transport Hostname="was7host01" Port="9443" Protocol="https"> 
 <Property name="keyring" value="C:\IBM\HTTPServer\Plugins\etc\plugin-key.kdb" /> 
 <Property name="stashfile" value="C:\IBM\HTTPServer\Plugins\etc\plugin-key.sth" /> 
 </Transport> 
 </Server>
 ...
```
通过 Plug-in，Web 服务器可以看到所有的 WebSphere Application Server，并且可以通过请求中的 session id 信息找到正确的 WebSphere Application Server，以实现 Session 亲和。这种亲和方式**默认是启用的**
与Apache的方式类似，IHS会在JSESSIONID的后面增加一个冒号，在冒号后面后缀上 cloneId 用来区分应用服务器（很类似jvmRoute）,IHS 根据 cloneId 后缀找到对应的应用服务器进行请求转发。抓取的Http请求片段如下
```
Set-Cookie: JSESSIONID=0000RUQB84B1YQXAyGjZIVottZH:185n02p8v; Path=/
```
Cookie 其实由3部分组成，CacheId + SessionId + :CloneId 。只有 CloneId 用于 Session 亲和。IBM官方文档见[
WebSphere Session IDs](https://www.ibm.com/developerworks/community/blogs/Dougclectica/entry/websphere_session_ids22?lang=en)。

## Nginx

Nginx (engine x) 是一个高性能的HTTP和反向代理服务。Nginx 是由伊戈尔·赛索耶夫为俄罗斯访问量第二的 Rambler.ru 站点（俄文：Рамблер）开发的，第一个公开版本0.1.0发布于2004年10月4日。
Nginx支持的亲和方式非常多，也很灵活，受篇幅限制，将会在第二篇详细讲解 Nginx 的配置方法。