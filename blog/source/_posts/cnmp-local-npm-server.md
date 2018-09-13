title: 使用CNPM搭建私有NPM仓库
date: 2016-06-01 11:13:52
categories: [技术]
tags: [Nodejs,cnpm]
photos:
- /resources/cnpm-local-npm-server/cnpmtitle.png
thumbnail: /resources/cnpm-local-npm-server/cnpmtitle.png
---
我们在使用Nodejs的时候，使用npm仓库来发布和管理模块，我们可以从npm上下载别人发布的模块使用，也可以自己发布模块，有点类似于Maven，这是非常流行的开源社区模式。但是在企业内部，我们不希望我们的生产代码可以随意引用任何未经企业审核的代码；我们也不希望企业内部自己的模块发布给任意人员使用；还有一个重要的原因是很多企业内部无法连接互联网`cnpm`就是来解决这些问题的。官方的解释是`cnpm`=**Company npm**
# 环境配置
* OS：Red Hat Enterprise Linux Server release 6.4 (Santiago)
* node：v4.4.5
* npm：2.15.5
* cnpm：2.10.0（截止到本文发布）

<!--more-->

# 安装MySQL
`cnpmjs.org`依赖一个数据库，官方支持`sqllite3`、`MySQL`、`MariaDB`、`PostgreSQL`中的任何一个，我选择了`MySQL`。
我们的操作系统是Red Hat 6.4，在这个动作之前应当将Red Hat自带的yum替换成CentOS的，此步骤不再赘述。
编辑源列表：
```shell
$ vim /etc/yum.repos.d/rhel-debuginfo.repo
```
添加如下内容：
```coffeescript
[mysql56]
name=MySQL 5.6
baseurl=http://repo.mysql.com/yum/mysql-5.6-community/el/6/$basearch/
enabled=1
gpgcheck=0
```
然后执行：
```shell
$ yum update
$ sudo yum install mysql-community-server
$ sudo service mysqld start
```
安装完成后，创建一个名叫cnpmjs的DATABASE。
```shell
$ mysql -u root -p

mysql> create datebase cnpmjs
```
# 安装cnpm
## 从`github`下载`cnpmjs.org`
```shell
$ git clone git://github.com/cnpm/cnpmjs.org.git
$ cd cnpmjs.org
#安装依赖
$ npm install
```
在国内npm缓慢甚至有些模块被墙，可以使用cnpm淘宝的镜像源安装。
## 初始化数据库
```
mysql> use cnpmjs;
mysql> source docs/db.sql
```

## 编辑配置文件
```
$ vim config/index.js
```
修改数据库配置，找到如下配置，将MySQL的配置填入
```
database: {
    db: 'cnpmjs',
    username: 'root',
    password: '123456',

    // the sql dialect of the database
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',

    // custom host; default: 127.0.0.1
    host: '127.0.0.1',

    // custom port; default: 3306
    port: 3306,

    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 30000
    },

    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  }
```
开启对外服务，注掉以下内容
```
//bindingHost: '127.0.0.1', // only binding on 127.0.0.1 for local access
```
同步模式，由于硬盘资源有限，我选择了exist只同步已经存在的模块
```
// sync mode select
// none: do not sync any module, proxy all public modules from sourceNpmRegistry
// exist: only sync exist modules
// all: sync all modules
syncModel: 'exist', // 'none', 'all', 'exist'
```
其他自定义配置，比如管理员、说明文档等等都可以自行修改。

启动
```shell
$ npm run start
```
停止
```shell
$ npm run stop
```
cnmp启动以后会占用7001和7002两个端口，在iptables中开放这两个端口。
打开浏览器输入`http://ip:7002`，看到如下界面，安装成功。我替换了个Logo
![cnpm](/resources/cnpm-local-npm-server/cnpm.png)

# 如何使用私有仓库
当我们使用私有的仓库时，模块就会从私有库中下载，如果私有库中没有，cnpm就会去npm仓库中下载，并保存在私有仓库一份。
## 下载指定私有库
```shell
$ npm install debug --registry=http://ip:7001
```
这样，本次下载npm就会从你指定的私有仓库中下载
## 修改默认库为私有库
如果不希望每一次都设置私有库，可以设置默认配置为私有仓库
```shell
# 列出npm配置
$ npm config list

$ npm config set registry http://ip:7001
```
这样，一个私有的npm仓库就算搭建完成了。
EOF
<!-- indicate-the-source -->
