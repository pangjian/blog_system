# 使用 node 6.10.3 的精简版作为基础镜像
FROM node:6.10.3-slim

# 安装 nginx
RUN apt-get update \
    && apt-get install -y nginx && npm i -g hexo-cli

# 指定工作目录
WORKDIR /blog_system

# 讲当前目录下的所有文件拷贝到工作目录下
COPY . /blog_system/

# 声明运行时容器提供的服务端口
EXPOSE 80

# 1.安装依赖
# 2.运行 hexo g
# 3.将生成的文件拷贝到 nginx 目录下
# 4.深处工作目录文件， 来减小镜像体积
# 由于镜像构建的每一步都会产生新层，为了减小体积，尽可能将一些同类操作，集成到一个步骤
RUN  cd blog \
     && npm install \
     && hexo g \
     && cp -r public/* /var/www/html \
     && rm -rf /blog_system
CMD ["nginx","-g","daemon off;"]
