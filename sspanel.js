// ==UserScript==
// @name              sspanel.dev
// @namespace         https://soulsign.inu1255.cn/scripts/208
// @version           1.2.2
// @author            Miao-Mico
// @loginURL          https://xixicats.pw
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.dev
// @expire            2000000
// @domain            sspanel
// @domain            ssr
// @domain            v2ray
// @domain            *
// @grant             require
// @param             domain 域名,https://i.cat,https://i.dog
// @param             keyword_positive 登录后应该有的关键字,我的,首页
// ==/UserScript==

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
        url: "https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc.js", // 地址
        hook: false, // 钩子
    }, // 依赖的核心
};

var req, mmc;

exports.run = async function (param) {
    req = await require(sspanel.core.url);
    mmc = await req(sspanel, param);

    /* 返回签到信息 */
    return await mmc.sign_in();
};

exports.check = async function (param) {
    req = await require(sspanel.core.url);
    mmc = await req(sspanel, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
