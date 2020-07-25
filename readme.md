<div align="center">
	<h1>SSPANEL - Soul Sign Script</h1>
</div>

## 功能

- 基本普适 `SSPANEL`<sup><font color=gray>Powered by </font><font color=#67a1f3>SSPANEL</font></sup> 搭建的站点
- 可扩展为 `Discuz!`<sup><font color=gray>Powered by </font><font color=black>**Discuz!**</font></sup> 等的其他类型站点签到
- 为**多个**类似站点签到

## 介绍

- 前提

    ```javascript

    var mmc = await require(site_config.core);
    var res = await mmc(site_config, param_config, debug_enable = false);
    
    ```
    
- **`mmc`** 传入参数

    - `site_config`: 网站配置

        ```javascript
        
        var sspanel = {
            core: "https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc.js", // 地址
            domain: ["suying999.net", "https://xixicats.pw"], // 域名
            path: {
                log_in: ["auth/login"], // 登录网址主机的
                sign_in: ["/user/checkin"], // 签到网址主机的
            }, // 路径
            keyword: {
                positive: ["首页", "我的"], // 应该有的
                negative: ["忘记密码"], // 不应该有的
            }, // 关键词
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
        
    - `debug_enable`: 是否开启 `debug` 模式

        此时会记录和输出一些日志

- **`res`** 成员

    1. `res.about`

        - 返回 关于

    2. `res.debug(level = 0)`

        - 返回 根据 `level` 决定的部分或全部内部变量值

    3. `res.record_log(site, code, message)`

        - 返回 参数 `message`

    4. `res.update_config(site_config, param_config)`<sup>dev</sup>

        - 无

    5. `res.publish_pipe(site, message)`

        - 返回  `message`

    6. `res.subscribe_pipe(site)`

        - 返回  `res.publish_pipe(which, message)` 中的 `message`

    7. `res.sign_in(full_log = false)`

        - full_log = true
          - 成功：❤️ mmc ❤️ < [ ✔ 网站: 提示语] >
          - 失败：❤️ mmc ❤️ < [ ❗ 网站: 问题] / [ ✔ 网站: 提示语] >
        - full_log = false
          - 成功：❤️ mmc ❤️ 
          - 失败：❤️ mmc ❤️ < [ ❗ 网站: 问题] >

        注：<...>，意为里面的内容可能会是重复的多个

    8. `res.check_online()`

        - 成功：`true`
        - 失败：`false`

- 例子

  - [spanel.js](/application/sspanel.js)
  - [natfrp.js](/application/natfrp.js)
  - [discuz.js](/application/discuz.js)

## 愿景

- [x] SSPANEL 普适签到脚本
- [x] 通过 `@param domain` 管理多个站点
- [x] 通过 `@param keyword` 配置检测关键词
- [x] 分离单独核心脚本，应用脚本轻量化
- [x] 通过 `hook` 可适用多种网站签到方式
- [x] 每种网站签到方式可以有多个 `path`，用来自动匹配不同网址<sup>dev</sup>
- [x] 每次调用脚本均刷新配置
- [x] 多个网站域名设置，提示 `domain配置不正确`，暂采用 `*.*` & `*.*.*`
- [ ] 处理失败时的多网站登录问题，需自行分别登录
- [ ] 格式化输出

## 更新

- 1.0.0
  
  1. 发布脚本
  
- [1.1.0](https://github.com/Miao-Mico/sspanel.soulsign/tree/267f8a66125afc7ec8a8d6f565e4f4a08347b709)<sup>**stable**</sup>
  
  1. 修复检测在线的问题
  
- 1.1.1
  
  1. 支持配置检查在线的关键字
  
- 1.1.2
  
  1. 支持配置多个域名
  
- 1.1.3
  1. 修改‘域名’文本框提示的文本
  2. 修改‘登录后应该有的关键字’文本框提示的文本
  
- 1.2.0
  
  1. 形成模板
  
- 1.2.1
  
  1. 支持 `hook`，可能能支持其他网站类型了
  
- 1.2.2
  
  1. 支持在 `hook` 中引入 `param`
  2. 支持 `pipe`，`hook` 间相互通信
  3. 增加 `asserts`，支持适应不同参数列表，主要是有无 @param
  4. 支持 `configs`，存储传入的参数，`site_config` & `param_config`
  5. 增加 `debugs`
  6. 增加 `system_log()`，方便调试，`record_log()` 也会调用它
  7. 增加 `debug()`，支持根据等级输出

- 1.2.3
  
  1. 修改了 `site_config` 的格式
  2. 修复了更新 `domain` 时，`sites` 内索引不对的情况
  3. 改变部分 `var` 为 `let`，主要是函数内地局部变量
  4. 增加 `update_config()`<sup>dev</sup>，用来自动更新配置参数
  
- 1.2.4
  1. 增加 `飘云阁.js`
  2. 增加 `natfrp领流量.js`
  3. 证明可以 `hook` 为其他类型签到，决定签到方式

- 1.2.5
  1. 增加 `about`
  2. 修改 `assert_type()`
  3. 修改 `view_log()` & `sign_in()`，支持结果全输出
  4. 增加更多 `system_log()`，在 `debug` 运行时记录日志

- 1.2.6
  1. 修改了 `site_config` 的格式
  2. 支持多个 `path`，即支持一种签到方式下的多种网址
  3. 修改文件目录
  
- 1.2.7
  
  1. 修复多个脚本调用不会刷新配置，取消缓存的特性
  
- 1.2.8
  1. 修复 `@domain` 配置问题
  2. 修改 `natfrp.js` 的提示信息，这个脚本可能暂时或永久失效，因为有了 `hCaptcha` 验证
  3. 修复部分变量名

## 鸣谢

所有给予灵感的脚本作者们

## Soul Sign

- [github](https://github.com/inu1255/soulsign-chrome)
- [chrome extension](https://chrome.google.com/webstore/detail/%E9%AD%82%E7%AD%BE/llbielhggjekmfjikgkcaloghnibafdl?hl=zh-CN)
- [firefox addon](https://addons.mozilla.org/zh-CN/firefox/addon/%E9%AD%82%E7%AD%BE)
- [soul sign scripts](https://soulsign.inu1255.cn) & [my scripts](https://soulsign.inu1255.cn/?uid=1178)
