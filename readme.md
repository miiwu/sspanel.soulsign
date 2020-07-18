<div align="center">
	<h1>SSPANEL<sup>Miao-Mico Core</sup> - Soul Sign Script</h1>
</div>

## 功能

本脚本预计作为 SSPANEL 系列的 require 核心。

基本普适 SSPANEL 搭建的站点，为其签到。

注：![sspanel](/sspanel.png)，一般为其标志。

## 介绍

- 传入参数

    - site_config: 网站配置

        ```javascript
        
        var sspanel = {
            dir: {
                log_in: "/auth/login", // 登录网址主机的
                sign_in: "/user/checkin", // 签到网址主机的
            }, // 网址主机的目录
            keyword: {
                positive: ["首页", "我的"], // 应该有的
                negative: ["忘记密码"], // 不应该有的
            }, // 检查是否在线时的关键词
            core: {
                url: "sspanel_mmc.js", // 地址
                hook: false, // 钩子
            }, // 依赖的核心
        };
        
        ```

    - param: 调用者的脚本参数

        ```javascript
        
        // ==UserScript==
        // ...
        // @grant             require
        // @param             domain 域名,https://i.cat,https://i.dog
        // @param             keyword_positive 登录后应该有的关键字,我的,首页
        // ...
        // ==/UserScript==
        
        ```

- 返回值

    1. xxx.debug()

        - 返回所有变量值
        
    2. xxx.record_log(site, code, message)

        - 返回 message

    3. xxx.sign_in()

        - 成功：❤️ sspanel.mmc ❤️
        - 失败：❤️ sspanel.mmc ❤️ < ❗ 网站: 问题>

        注：<...>，意为里面的内容可能会是重复的多个

    4. xxx.check_online()

        - 成功：true
        - 失败：false

- 例子

  ```javascript
  
  var req = await require(sspanel.core.url);
  var mmc = await req(sspanel, param);
  
  /* 返回签到信息 */
  return await mmc.check_online();
  
  ```

  - [spanel.js](https://github.com/Miao-Mico/sspanel.soulsign/blob/dev.mm_core/sspanel.js)

## 愿景

- [x] SSPANEL 普适签到脚本
- [x] 通过 @param domain 管理多个站点
- [x] 通过 @param keyword 配置检测关键词
- [x] 分离单独核心脚本，应用脚本轻量化
- [ ] 再分离，可适用多种网站方式

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
     - 成功：不会显示任何东西
     
     - 失败：<网站: 问题>
     
       注：<...>，意为里面的内容可能会是重复的多个
- 1.1.3
  1. 修改‘域名’文本框提示的文本
  2. 修改‘登录后应该有的关键字’文本框提示的文本
- 1.2.0
  
  1. 形成模板
- 1.2.1
  1. 支持 hook，可能能支持其他网站类型了
  
  2. 说明：
     
     1. 传入参数
     
     - 成功：❤️ sspanel.mmc ❤️
     
     - 失败：❤️ sspanel.mmc ❤️< ❗ 网站: 问题>
     
       注：<...>，意为里面的内容可能会是重复的多个

## 鸣谢

所有给予灵感的脚本作者们

## Soul Sign

- [github](https://github.com/inu1255/soulsign-chrome)
- [chrome extension](https://chrome.google.com/webstore/detail/%E9%AD%82%E7%AD%BE/llbielhggjekmfjikgkcaloghnibafdl?hl=zh-CN)
- [firefox addon](https://addons.mozilla.org/zh-CN/firefox/addon/%E9%AD%82%E7%AD%BE)
- [soul sign scripts](https://soulsign.inu1255.cn) & [my scripts](https://soulsign.inu1255.cn/?uid=1178)