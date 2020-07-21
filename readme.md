<div align="center">
	<h1>SSPANEL<sup>Miao-Mico Core</sup> - Soul Sign Script</h1>
</div>

## 功能

本脚本预计作为 `SSPANEL` 系列的 **`require`** 核心。

基本普适 SSPANEL 搭建的站点，为其签到。

注：![sspanel](/sspanel.png)，一般为其标志。

## 介绍

- 传入参数

    - `site_config`: 网站配置

        ```javascript
        
        var sspanel = {
            core: "https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc.js", // 地址
            domain: ["https://suying999.net", "https://xixicats.pw"], // 域名列表
            dir: {
                log_in: "/auth/login", // 登录网址主机的
                sign_in: "/user/checkin", // 签到网址主机的
            }, // 网址主机的目录
            keyword: {
                positive: ["首页", "我的"], // 应该有的
                negative: ["忘记密码"], // 不应该有的
            }, // 检查是否在线时的关键词
            hook: false, // 钩子
        };
        
        ```
        
    - `param_config`: 调用者的脚本参数

        ```
        
        // ==UserScript==
        // ...
        // @grant             require
        // @param             domain 域名,https://i.cat,https://i.dog
        // @param             keyword_positive 登录后应该有的关键字,我的,首页
        // ...
        // ==/UserScript==
        
        ```
    
- 返回值

    1. `xxx.about`

        - 返回其值

    2. `xxx.debug(level)`

        - 返回变量值

    3. `xxx.record_log(site, code, message)`

        - 返回 `message`

    4. `xxx.update_config(site_config, param_config)`<sup>dev</sup>

        - 无

    5. `xxx.publish_pipe(which, message)`

        - 返回 `message`

    6. `xxx.subscribe_pipe(which)`

        - 返回 `xxx.publish_pipe(which, message)` 中的 `message`

    7. `xxx.sign_in()`

        - 成功：❤️ sspanel.mmc ❤️
        - 失败：❤️ sspanel.mmc ❤️ < ❗ 网站: 问题>

        注：<...>，意为里面的内容可能会是重复的多个

    8. `xxx.check_online()`

        - 成功：`true`
        - 失败：`false`

- 例子

  ```javascript
  
  var req = await require(sspanel.core.url);
  var mmc = await req(sspanel, param);
  
  /* 返回签到信息 */
  return await mmc.check_online();
  
  ```

  - [spanel.js](https://github.com/Miao-Mico/sspanel.soulsign/blob/dev.mm_core/sspanel.js)
  - [natfrp.js](https://github.com/Miao-Mico/sspanel.soulsign/blob/dev.mm_core/natfrp.js)
  - [discuz_pyg.js](https://github.com/Miao-Mico/sspanel.soulsign/blob/dev.mm_core/discuz_pyg.js)

## 愿景

- [x] SSPANEL 普适签到脚本
- [x] 通过 `@param domain` 管理多个站点
- [x] 通过 `@param keyword` 配置检测关键词
- [x] 分离单独核心脚本，应用脚本轻量化
- [x] 可适用多种网站方式
- [ ] 处理失败时的多网站登录问题
- [ ] 格式化输出

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
  1. 支持 `hook`，可能能支持其他网站类型了
  
  2. 说明：
     
     1. 传入参数
     
     - 成功：❤️ sspanel.mmc ❤️
     
     - 失败：❤️ sspanel.mmc ❤️< ❗ 网站: 问题>
     
       注：<...>，意为里面的内容可能会是重复的多个

- 1.2.2
  
  1. 支持在 `hook` 中引入 `param`
  2. 支持 `pipe`，`hook` 间相互通信
  3. 增加 `asserts`，支持适应不同参数列表，主要是有无 @param
  4. 支持 `configs`，存储传入的参数，`site_config` & `param_config`
  5. 增加 `debugs`
  6. 增加 `system_log()`，方便调试，`record_log()` 也会调用它
  7. 增加 `debug()`，支持根据等级输出

- 1.2.3
  
  1. 改变了网址配置的格式
  2. 修复了更新 `domain` 时，`sites` 内索引不对的情况
  3. 改变部分 `var` 为 `let`，主要是函数内地局部变量
  4. 增加 `update_config()`<sup>dev</sup>，用来自动更新配置参数
  
- 1.2.4

  1. 增加 `飘云阁.js`
  2. 增加 `natfrp领流量.js`
  3. 证明可以 `hook` 为其他类型签到
  
- 1.2.5

  1. 增加 `about`
  2. 修改 `assert_type()`
  3. 修改 `view_log()` & `sign_in()`，支持结果全输出
  4. 增加更多 `system_log()`，在 `debug` 运行时记录日志

## 鸣谢

所有给予灵感的脚本作者们

## Soul Sign

- [github](https://github.com/inu1255/soulsign-chrome)
- [chrome extension](https://chrome.google.com/webstore/detail/%E9%AD%82%E7%AD%BE/llbielhggjekmfjikgkcaloghnibafdl?hl=zh-CN)
- [firefox addon](https://addons.mozilla.org/zh-CN/firefox/addon/%E9%AD%82%E7%AD%BE)
- [soul sign scripts](https://soulsign.inu1255.cn) & [my scripts](https://soulsign.inu1255.cn/?uid=1178)