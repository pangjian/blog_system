title: 全站HTTPS改造
date: 2017-01-24 11:30:09
categories: [技术]
tags: [https,nginx]
photos:
- /resources/whole-site-https/https.png
thumbnail: /resources/whole-site-https/https.png
cover: /resources/whole-site-https/https.png
---
HTTPS大势已来，2016年6月苹果宣布要求所有iOS Apps在2017年初全部使用HTTPS，11月Google宣布，从17年1月开始，对没有使用HTTPS的网站竖起“不安全”的小红旗。15年，淘宝、天猫也启动了HTTPS迁移。国内网络环境也不太好，经常会有运营商篡改页面的情况，为了更安全的客户体验，避免各种情况同事顺应大势所趋，本博客也进行了全站HTTPS化。
<!--more-->
# 申请证书
我使用的是[Let's Encrypt](https://letsencrypt.org)证书,它由ISRG（Internet Security Research Group，互联网安全研究小组）提供服务。Let's Encrypt得到了众多大公司和机构的支持，比如Mozilla、Cisco、Chrome等。近期发展十分迅猛。
Let's Encrypt的申请是免费的，但是有90天的有效期。但是可以通过脚本自动更新，配置以后就一劳永逸了。配置参考了Jerry Qu的博客文章[Let's Encrypt，免费好用的 HTTPS 证书](https://imququ.com/post/letsencrypt-certificate.html)。过程讲解的非常详细，本处就不在赘述，贴上过程使用命令以备后查。
## 创建账号
先创建一个`ssl`文件夹用来存放文件
```bash
openssl genrsa 4096 > account.key
```
## 创建CSR文件
创建ECC私钥
```bash
openssl ecparam -genkey -name secp256r1 | openssl ec -out domain.key
```
生成CSR文件
```bash
openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:pangjian.me,DNS:www.pangjian.me")) > domain.csr
```
## 配置验证服务
此过程非常重要，用来和Let's Encrypt验证域名的控制权。采用`acme-tiny`脚本
先创建一个验证文件夹，比如`/home/pangjian/www/challenges`，然后配置一个HTTP服务

```config
server {
    server_name www.pangjian.me pangjian.me;

    location ^~ /.well-known/acme-challenge/ {
        alias /home/pangjian/www/challenges/;
        try_files $uri =404;
    }

    location / {
        rewrite ^/(.*)$ https://www.pangjian.me/$1 permanent;
    }
}
```

下载`acme-tiny`脚本并执行

```bash
wget https://raw.githubusercontent.com/diafygi/acme-tiny/master/acme_tiny.py
python acme_tiny.py --account-key ./account.key --csr ./domain.csr --acme-dir /home/pangjian/www/challenges > ./signed.crt
```

过程就是脚本先在指定文件夹生成一个验证文件，通过http服务可以下载，Let's Encrypt来访问你的服务下载文件，达到验证效果。
下载中间证书，并将网站证书和中间证书结合在一起

```bash
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > chained.pem
```
至此，证书申请完毕，但是有90天的有效期限制，需要配置自动更新。用crontab定期执行acme_tiny脚本就OK啦。
## 自动更新
renew_cert.sh内容

```bash
#!/bin/bash
cd /home/pangjian/ssl/
python acme_tiny.py --account-key account.key --csr domain.csr --acme-dir /home/pangjian/www/challenges > signed.crt || exit
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > chained.pem
service nginx reload
```

执行`crontab -e`，输入以下内容
```bash
0 0 1 * * /home/pangjian/ssl/renew_cert.sh >/dev/null 2>&1
```

# Nginx配置
在Nginx配置中增加上证书信息
```config
ssl_certificate     /home/pangjian/ssl/chained.pem;
ssl_certificate_key /home/pangjian/ssl/domain.key;
```
在http的服务中除了验证服务以外，其他请求都rewrite到https服务下，
```config
location / {
        rewrite ^/(.*)$ https://www.pangjian.me/$1 permanent;
    }
```

# 静态资源和多说https化
多说原先不支持Https是一直被人诟病和转战Disqus的理由，要实现全站HTTPS必然要搞定多说。首先，多说官方说除了第三方头像其他的都已经支持https，但是头像也不能忽视啊，况且第三方已经支持https了。我下载了多说的js进行了修改，成功将头像、表情转换为https。
首先先下载多说的[`embed.js`](https://static.duoshuo.com/embed.js)，
## 修改头像链接
搜索avatar_url，对url进行字符串替换
```js
    avatarUrl: function(e) {
      var s = e.avatar_url || rt.data.default_avatar_url;
      s=s.replace(/http:/g,'https:');
      return s;
    },
```
## 修改表情链接
```js
  var t = ""
  , s = e.post
  , i = e.options
  , r = s.author;
  s.message = s.message.replace(/http:/g, 'https:')
```
全站HTTPS改造完毕，看见这个绿色的小锁，心情真好！
![https](/resources/whole-site-https/httpsdone.png)

## 安全测试

![安全测试报告](/resources/whole-site-https/sslreport.png)

[查看完整的测试结果>>](https://www.ssllabs.com/ssltest/analyze.html?d=www.pangjian.me)

EOF
<!-- indicate-the-source -->
