<div align="center">
	<h1>SSPANEL<sup>Miao-Mico Core</sup> - Soul Sign Script</h1>
</div>

## 功能

本脚本预计作为 SSPANEL 系列的 require 核心。

基本普适 SSPANEL 搭建的站点，为其签到。

注：![sspanel](/sspanel.png)，一般为其标志。

## 方法

- 配置参数 @domain：
    1. 操作
    2. 小齿轮
    3. 域名
- 移植其他网站：
    1. 修改 @loginURL
    2. 修改 @domain
    3. 修改 @name(可选)

## 愿景

- [x] SSPANEL 普适签到脚本
- [x] 通过 @param domain 管理多个站点
- [x] 通过 @param keyword 配置检测关键词
- [ ] 分离单独核心脚本，应用脚本轻量化

## 更新

- 1.0.0
  1. 发布脚本
- 1.1.0
  1. 修复检测在线的问题
- 1.1.1
  1. 支持配置检查在线的关键字
- 1.1.2
  1. 支持配置多个域名
  2. 说明：
     - 成功：执行结果，不会显示任何东西
     - 失败：执行结果，显示 [哪个网站: 怎么了]
- 1.1.3
  1. 修改‘域名’文本框提示的文本
  2. 修改‘登录后应该有的关键字’文本框提示的文本
- 1.2.0
  1. 尝试修改原脚本

## 鸣谢

所有给予灵感的脚本作者们

## Soul Sign

- [github](https://github.com/inu1255/soulsign-chrome)
- [chrome extension](https://chrome.google.com/webstore/detail/%E9%AD%82%E7%AD%BE/llbielhggjekmfjikgkcaloghnibafdl?hl=zh-CN)
- [firefox addon](https://addons.mozilla.org/zh-CN/firefox/addon/%E9%AD%82%E7%AD%BE)
- [soul sign scripts](https://soulsign.inu1255.cn) & [my scripts](https://soulsign.inu1255.cn/?uid=1178)