title: Jackson中的那些坑
date: 2015-10-30 08:19:33
tags: [json,java,jackson]
photos:
- /resources/json-and-java-object/JSON.png
thumbnail: /resources/json-and-java-object/JSON.png
---

# 不符合驼峰规范的变量
“驼峰命名法”请自行百度。简单的来说就是变量的第一个单词以小写字母开始其他单词首字母大写，或者全部单词首字母都大写，分别称为“小驼峰”和“大驼峰”
<!--more-->
比如一个符合驼峰规范命名的实体：
```java
public class Entity {
    String beFlag;
    public String getBeFlag() {
        return beFlag;
    }
    public void setBeFlag(String beFlag) {
        beFlag = beFlag;
    }
}
```
转化的JSON为:
```json
{"beFlag":null}
```
前段时间走查代码时发现一个问题，实体中有一个字段为ECash。驼峰规范中并没有详细说明这种单词只有一个字母的变量是否符合驼峰规范。当遇到这种变量时，转化的JSON发送了问题，我们的预期应该是这样的
```json
{“eCash”:null}
```
但实际情况是这样的
```json
{“ecash”:null}
```
没错，字母全部被小写了。这可是个大问题，接口文档按经验肯定是错的。
如何解决呢？
当然是尽量按照驼峰规范命名变量，如果不行，那就得使用注解的方式。
Jackson提供了” JsonProperty”注解方式，使用如下代码
```java
public class Entity {
    @JsonProperty
    String ECash;

    public String getECash() {
        return ECash;
    }

    public void setECash(String eCash) {
        ECash = eCash;
    }
}
```
得到的JSON结果为
```json
{"ECash":null,"ecash":null}
```
虽然我们希望的”ECash“来了，但是之前全小写的还存在。这是因为ECash的get方法，使用@JsonIgnore即可解决。代码变成这样:
```java
public class Entity {
    @JsonProperty
    String ECash;

    @JsonIgnore
    public String getECash() {
        return ECash;
    }

    public void setECash(String eCash) {
        ECash = eCash;
    }
}
```
得到的JSON结果为：
```json
{"ECash":null}
```
至此，问题解决了。除此之外，JsonProperty还可以指定JSON中的值，比如这样：
```java
public class Entity {
    @JsonProperty("eCash")
    String ECash;

    @JsonIgnore
    public String getECash() {
        return ECash;
    }
    public void setECash(String eCash) {
        ECash = eCash;
    }
}
```
即指定JSON的结果为小驼峰模式。
```json
{"eCash":null}
```
举一反三，JsonProperty的使用场景还有很多，除了解决这个“坑”以外。还可以直接用来转换类UNIX习惯的下划线间隔的变量转化为驼峰规范。
<!-- indicate-the-source -->
