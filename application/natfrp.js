// ==UserScript==
// @name              natfrp
// @namespace         https://soulsign.inu1255.cn/scripts/219
// @version           1.2.8
// @author            sunzehui
// @author            Miao-Mico
// @loginURL          https://www.natfrp.com/user
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/natfrp
// @grant             require
// @expire            2000000
// @domain            www.natfrp.com
// ==/UserScript==

let natfrp = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/mmc.js", // 地址
    domain: ["www.natfrp.com"],
    path: {
        log_in: ["tunnel/sign"], // 登录网址主机的
        sign_in: ["ajax/sign"], // 签到网址主机的
    }, // 网址主机的目录
    keyword: {
        positive: ["退出登录", "管理面板"], // 应该有的
        negative: ["忘记密码"], // 不应该有的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            let data_gli = await axios.get(site.url.get);

            /* 发布管道信息 */
            await mmc.publish_pipe(site, data_gli.data);

            return { code: 0, data: data_gli };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param) {
            /* 订阅管道信息 */
            let data_psi = await mmc.subscribe_pipe(site);

            try {
                /* 匹配 csrf 信息 */
                let csrf = data_psi.match(/(\'csrf\': \')([^/:]+).*?(\'\r\n)/)[2];

                /* 推送签到信息 */
                data_psi = await axios.post(site.url.post, `csrf=${csrf}`);

                return { code: 0, data: data_psi.data.message };
            } catch (TypeError) {
                return { code: 1, data: "签到失败。无 csrf 或 Captcha 验证!" };
            }
        }, // 推送网址签到信息
    }, // 钩子
};

let mmc;

exports.run = async function (param) {
    mmc = await require(natfrp.core);
    mmc = await mmc(natfrp, param);

    /* 返回签到信息 */
    return await mmc.sign_in(true);
};

exports.check = async function (param) {
    mmc = await require(natfrp.core);
    mmc = await mmc(natfrp, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
