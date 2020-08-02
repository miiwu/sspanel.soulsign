// ==UserScript==
// @name              sspanel
// @namespace         https://soulsign.inu1255.cn/scripts/222
// @version           1.2.11
// @author            Miao-Mico
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/sspanel
// @grant             require
// @expire            2000000
// @domain            SSPANEL
// @domain            ssr
// @domain            v2ray
// @domain            *.*
// @domain            *.*.*
// @domain            *.*.*.*
// @param             domain 域名,<i.cat>,<http(s)://i.dog>
// ==/UserScript==

let sspanel = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/mmc.js", // 地址
    domain: [], // 域名
    path: {
        log_in: ["auth/login"], // 登录网址主机的
        sign_in: ["user/checkin"], // 签到网址主机的
    }, // 路径
    keyword: {
        online: ["我的", "节点"], // 在线的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            return { code: 0, data: await axios.get(site.url.get) };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param, data) {
            /* 推送签到信息 */
            let data_psi = await axios.post(site.url.post);

            /* 返回信息 */
            return { code: 0, data: data_psi.data.msg };
        }, // 推送网址签到信息
    }, // 钩子
};

let mmc;

exports.run = async function (param) {
    mmc = await require(sspanel.core);
    mmc = await mmc(sspanel, param);

    /* 返回签到信息 */
    return await mmc.sign_in(true);
};

exports.check = async function (param) {
    mmc = await require(sspanel.core);
    mmc = await mmc(sspanel, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
