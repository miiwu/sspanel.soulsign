// ==UserScript==
// @name              discuz.k
// @namespace         https://soulsign.inu1255.cn/scripts/229
// @version           1.2.15
// @author            ViCrack
// @author            Miao-Mico
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/discuz.k
// @grant             require
// @expire            2000000
// @domain            *
// @domain            *.*
// @domain            *.*.*
// @domain            *.*.*.*
// @domain            Discuz!
// @param             domain 域名,<i.cat>,<http(s)://i.dog>
// @param             path_log_in 登录路径,<i/cat>,</i/dog>
// @param             path_sign_in 签到路径,<i/cat>,</i/dog>
// @param             keyword_online 在线关键字,</cat/>,<dog>
// @param             keyword_signed 已经签到关键字,</cat/>,<dog>
// @param             keyword_signing 正在签到关键字,</cat/>,<dog>
// ==/UserScript==

let discuz_k = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/mmc.js", // 地址
    path: {
        log_in: ["plugin.php?id=k_misign:sign"], // 登录的
        sign_in: ["plugin.php?id=k_misign:sign&operation=qiandao"], // 签到的
    }, // 网址主机的目录
    keyword: {
        online: [/退出/], // 在线的
        signed: [/ (您的签到排名：)([^ ]+) /, /(您的签到排名：).*i>([^ ]+)<\/i/], // 已经签到的
        signing: [/CDATA\[([^\]]*)\]/], // 正在签到的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            return { code: 0, data: await axios.get(site.url.get) };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param, data) {
            try {
                /* 配置推送信息 */
                let formhash = "";
                let table_fh = [/formhash=([^&"]+)/, /name="formhash" value="([^"]+)/];
                for (let item of table_fh) if (!!(formhash = data.data.match(item))) break;
                formhash = formhash[1];

                /* 推送签到信息, 正则匹配消息 */
                let data_psi = await axios.post(site.url.post, `formhash=${formhash}&format=empty`);

                /* 返回消息 */
                return { code: 0, data: data_psi.data };
            } catch (exception) {
                return { code: 1, data: exception.message };
            }
        }, // 推送网址签到信息
        notify_signed: async function (array) {
            return { code: 0, data: array[1] + array[2] };
        }, // 个性化已经签到信息
        notify_signing: async function (array) {
            if (array[1].length) return { code: !/已|成功/.test(array[1]), data: array[1] };
            else return { code: 0, data: "签到成功" };
        }, // 个性化正在签到信息
        filter_unbefitting: async function (data) {
            if (/插件不存在或已关闭/.test(data.data)) return { code: 2, message: "请检查 Discuz 插件是否为 K" };
            return { code: 0 };
        }, // 过滤未适配网站
    }, // 钩子
};

let mmc;

exports.run = async function (param) {
    mmc = await require(discuz_k.core);
    mmc = await mmc(discuz_k, param, { ssv: !!tools ? tools.version : undefined });

    /* 返回签到信息 */
    return await mmc.sign_in(true);
};

exports.check = async function (param) {
    mmc = await require(discuz_k.core);
    mmc = await mmc(discuz_k, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
