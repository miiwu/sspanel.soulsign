// ==UserScript==
// @name              SSPANEL
// @namespace         https://github.com/Miao-Mico/sspanel.soulsign
// @version           1.1.0
// @author            Miao-Mico
// @loginURL          https://sspanel.com
// @updateURL         https://github.com/Miao-Mico/sspanel.soulsign
// @expire            2000000
// @domain            SSPANEL
// @domain            SSR
// @domain            V2RAY
// @domain            sspanel.com
// @param             domain 域名,https://sspanel.com
// ==/UserScript==

var sspanel = {
    dir: {
        log_in: '/auth/login',
        sign_in: '/user/checkin'
    },
    keyword: {
        online: {
            positive: ['首页', '我的'],
            negative: ['忘记密码']
        }
    }
};

var axios_cfg = {
    post: {
        method: 'post',
        url: '',
    },
    get: {
        method: 'get',
        url: '',
    }
};

async function config_domain(param, axios_config, site_config) {
    /* 合成网址 */
    axios_config.get.url = param.domain + site_config.dir.log_in;
    axios_config.post.url = param.domain + site_config.dir.sign_in;
}

async function check_online(param, axios_config, site_config) {
    /* 配置域名字符串 */
    await config_domain(param, axios_config, site_config);

    /* 获取登录信息 */
    var { data } = await axios(axios_config.get);

    /* 创建用于匹配规则的变量 */
    var cnt = 0;
    var mismatch = 0;

    /* 判断 online 的关键词 ，应存在的 */
    for (cnt = 0; cnt < site_config.keyword.online.positive.length; cnt++) {
        if (!RegExp(site_config.keyword.online.positive[cnt]).test(data)) {
            mismatch = mismatch + 1;
        }
    }

    /* 判断 online 的关键词 ，不应存在的 */
    for (cnt = 0; cnt < site_config.keyword.online.negative.length; cnt++) {
        if (RegExp(site_config.keyword.online.negative[cnt]).test(data)) {
            mismatch = mismatch + 1;
        }
    }

    /* 返回不匹配数量的反 */
    return Boolean(!mismatch);
}

exports.run = async function (param) {
    /* 检查是否在线 */
    if (!await check_online(param, axios_cfg, sspanel)) {
        throw '请登录';
    }

    /* 推送签到信息 */
    var { data } = await axios(axios_cfg.post);

    /* 返回网址信息 */
    return data.msg;
};

exports.check = async function (param) {
    /* 返回是否在线 */
    return await check_online(param, axios_cfg, sspanel);
};