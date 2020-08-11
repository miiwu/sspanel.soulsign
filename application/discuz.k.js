// ==UserScript==
// @name              discuz.k
// @namespace         https://soulsign.inu1255.cn/scripts/229
// @version           1.2.13
// @author            ViCrack
// @author            Miao-Mico
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/discuz.k
// @grant             require
// @expire            2000000
// @domain            Discuz!
// @domain            *.*
// @domain            *.*.*
// @domain            *.*.*.*
// @param             domain 域名,<i.cat>,<http(s)://i.dog>
// @param             path_log_in 登录路径,<i/cat>,</i/dog>
// @param             path_sign_in 签到路径,<i/cat>,</i/dog>
// @param             keyword_online 在线关键字,</cat/>,<dog>
// @param             keyword_signed 已签到关键字,</cat/>,<dog>
// ==/UserScript==

let discuz_k = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/mmc.js", // 地址
    domain: [], // 域名
    path: {
        log_in: ["plugin.php?id=k_misign:sign"], // 登录的
        sign_in: [""], // 签到的
    }, // 网址主机的目录
    keyword: {
        online: [/退出/], // 在线的
        signed: [/ (您的签到排名：)(.*) /, /(您的签到排名：).*i>(.*)<\/i/], // 已经签到的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            return { code: 0, data: await axios.get(site.url.get) };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param, data) {
            try {
                /* 配置推送信息 */
                let sign_url = data.data.match(/<a id="JD_sign".* href="(.*?)"/)[1];

                /* 推送签到信息 */
                let data_psi = await axios.post(`${site.scheme}://${site.domain}/${sign_url}`);

                /* 正则匹配消息 */
                return { code: 0, data: "签到成功" };
            } catch (exception) {
                return { code: 1, data: "签到失败" };
            }
        }, // 推送网址签到信息
        notify_sign_in: async function (array) {
            return { code: 0, data: array[1] + array[2] };
        },
    }, // 钩子
};

let mmc;

exports.run = async function (param) {
    mmc = await require(discuz_k.core);
    mmc = await mmc(discuz_k, param);

    /* 返回签到信息 */
    return await mmc.sign_in(true);
};

exports.check = async function (param) {
    mmc = await require(discuz_k.core);
    mmc = await mmc(discuz_k, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
