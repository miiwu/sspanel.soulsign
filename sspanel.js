// ==UserScript==
// @name              SSPANEL
// @namespace         https://github.com/Miao-Mico/sspanel.soulsign
// @version           1.0.0
// @author            Miao-Mico
// @loginURL          https://sspanel.com
// @updateURL         
// @expire            2000
// @domain            sspanel.com
// @param             domain 域名,https://sspanel.com
// ==/UserScript==

var sspanel = {
    dir: {
        log_in: '/auth/login',
        sign_in: '/user/checkin'
    },
    url: {
        log_in: '',
        sign_in: ''
    },
    keyword: {
        online: {
            positive: ['首页', '我的'],
            negative: ['忘记密码']
        }
    }
};

var axios_config = {
    post: {
        method: 'post',
        url: '',
    },
    get: {
        method: 'get',
        url: '',
    }
};

config_domain = async function (param, axios_config, site_config) {
    /* 合成 url */
    site_config.url.log_in = param.domain + site_config.dir.log_in;
    site_config.url.sign_in = param.domain + site_config.dir.sign_in;

    axios_config.post.url = site_config.url.sign_in;
    axios_config.get.url = site_config.url.log_in;
}

match_keyword = async function (site_config, data) {
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

    return !mismatch;
}

check_online = async function (param, axios_config, site_config) {
    // 配置域名字符串
    config_domain(param, axios_config, site_config);

    // 请求网站数据
    var { data } = await axios(axios_config.get);

    /* 返回不匹配数量的反 */
    return match_keyword(site_config, data);
}

exports.run = async function (param) {
    // 检查是否在线
    if (!check_online(param)) {
        throw '请登录';
    }

    var { data } = await axios(axios_config.post);

    return data.msg;
};

exports.check = async function (param) {
    return check_online(param);
};