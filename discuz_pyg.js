// ==UserScript==
// @name              飘云阁
// @namespace         https://soulsign.inu1255.cn?account=Miao-Mico
// @version           1.2.4
// @author            honourjawy
// @author            Miao-Mico
// @loginURL          https://www.chinapyg.com
// @updateURL
// @expire            14400000
// @domain            www.chinapyg.com
// @grant             require
// @param             say 签到时说些什么,可用|分隔
// ==/UserScript==

var discuz_pyg = {
    core: "https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc.js", // 核心地址
    domain: ["https://www.chinapyg.com"], // 域名列表
    dir: {
        log_in:
            "/plugin.php?id=dsu_paulsign:sign&576989e1&infloat=yes&handlekey=dsu_paulsign&inajax=1&ajaxtarget=fwin_content_dsu_paulsign", // 登录网址主机的
        sign_in: "/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&sign_as=1&inajax=1", // 签到网址主机的
    }, // 网址主机的目录
    keyword: {
        positive: ["每日签到"], // 应该有的
        negative: ["先登录", "继续本操作"], // 不应该有的
    }, // 检查是否在线时的关键词
    hook: {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            let data_gli = await axios.get(site.url.get);

            /* 发布管道信息 */
            await mmc.publish_pipe(0, data_gli.data);

            /* 返回 hook */
            return { code: 0, data: data_gli };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param) {
            /* 订阅管道信息 */
            let data_psi = await mmc.subscribe_pipe(0);

            /* 检查是否已经签到 */
            if (/已经签到/.test(data_psi)) {
                return { code: 0, data: "已经签到" };
            } else {
                /* 匹配哈希 */
                let formhash = /name="formhash" value="([^"]+)/.exec(data_psi);
                if (!formhash) {
                    return { code: 1, data: "签到失败" };
                }

                /* 合成签到时说些什么 */
                let ss = (param.say || "开心").split("|");
                let say = encodeURIComponent(ss[Math.floor(Math.random() * ss.length)]);

                /* 推送签到信息 */
                data_psi = await axios.post(
                    site.url.post,
                    `formhash=${formhash[1]}&qdxq=kx&qdmode=1&todaysay=${say}&fastreply=1`
                );

                if (/签到成功/.test(data_psi.data)) return { code: 0, data: "签到成功" };

                return { code: 1, data: "签到失败" };
            }
        }, // 推送网址签到信息
    }, // 钩子
};

var req, mmc;

exports.run = async function (param) {
    mmc = await require(discuz_pyg.core);
    mmc = await mmc(discuz_pyg, param);

    /* 返回签到信息 */
    return await mmc.sign_in();
};

exports.check = async function (param) {
    req = await require(discuz_pyg.core);
    mmc = await req(discuz_pyg, param);

    /* 返回是否在线 */
    return await mmc.check_online();
};
