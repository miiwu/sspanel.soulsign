// ==UserScript==
// @name              discuz
// @namespace         https://soulsign.inu1255.cn/scripts/221
// @version           1.2.10
// @author            honourjawy
// @author            Miao-Mico
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/discuz
// @grant             require
// @expire            2000000
// @domain            Discuz!
// @domain            *.*
// @domain            *.*.*
// @domain            *.*.*.*
// @param             domain 域名,([http://]i.cat),([https://]i.dog)
// @param             say 签到时说些什么,可用|分隔
// ==/UserScript==

let discuz = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/mmc.dev.js", // 核心地址
    domain: [], // 域名
    path: {
        log_in: ["plugin.php?id=dsu_paulsign:sign"], // 登录网址主机的
        sign_in: ["plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1"], // 签到网址主机的
    }, // 网址主机的目录
    keyword: {
        online: ["每日签到"], // 在线的
        signed: ["您今天已经签到过了或者签到时间还未开始"], // 已经签到的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            return { code: 0, data: await axios.get(site.url.get) };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param) {
            /* 订阅管道信息 */
            let data_psi = await mmc.persistence_log(site);

            /* 匹配哈希 */
            let formhash = /name="formhash" value="([^"]+)/.exec(data_psi.data);

            if (!formhash) {
                return { code: 1, data: "无凭据" };
            }

            /* 合成签到时说些什么 */
            let ss = (param.say || "开心").split("|");
            let say = encodeURIComponent(ss[Math.floor(Math.random() * ss.length)]);

            /* 推送签到信息 */
            data_psi = await axios.post(
                site.url.post,
                `formhash=${formhash[1]}&qdxq=kx&qdmode=1&todaysay=${say}&fastreply=1`
            );

            if (/签到成功/.test(data_psi.data)) {
                return { code: 0, data: "签到成功" };
            }

            return { code: 1, data: "签到失败" };
        }, // 推送网址签到信息
    }, // 钩子
};

let mmc;

exports.run = async function (param) {
    mmc = await require(discuz.core);
    mmc = await mmc(discuz, param);

    /* 返回签到信息 */
    return await mmc.sign_in(true);
};

exports.check = async function (param) {
    mmc = await require(discuz.core);
    mmc = await mmc(discuz, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
