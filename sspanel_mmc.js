// ==UserScript==
// @name              sspanel.mmc
// @namespace         https://soulsign.inu1255.cn/scripts/212
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc
// @version           1.2.0
// @author            Miao-Mico
// @expire            2000000
// @domain            sspanel
// @domain            ssr
// @domain            v2ray
// @domain            *
// ==/UserScript==

(function () {
    var log = {
        exceptions: false,// 是否有异常或错误
        site: [],
    }

    async function record_log(index, code, message) {// 记录日志
        var site = {
            index: 0,
            message: '',
        }

        /* 记录异常或错误状态 */
        if (!log.exceptions && parseInt(0) != parseInt(code)) {
            log.exceptions = true;
        }

        site.index = index;
        site.message = message;

        var existing = false,// 此索引的日志是否已经存在
            position = 0;// 若日志已存在，在 log.site 的位置

        /* 检查是否已经存在日志 */
        for (; position < log.site.length; position++) {
            if (index == log.site[position].index) {
                existing = true;
                break;
            }
        }

        if (existing) {
            /* 修改为最新 site */
            log.site[position] = site;
        } else {
            /* 压入 log 中的 site 类 */
            log.site.push(site);
        }
    }

    async function view_log(site_config) {// 打印日志
        var log_string = '';

        /* 从索引转换到域名 */
        for (var cnt = 0; cnt < log.site.length; cnt++) {
            var site = site_config.site[log.site[cnt].index];
            /* 如果成功 */
            if (site.succeed) {
                continue;
            }

            /* 格式化输出 */
            log_string = log_string + site.domain;
            log_string = log_string + ': ';
            log_string = log_string + log.site[cnt].message;
        }

        /* 决定通知强度 */
        if (log.exceptions) {
            throw log_string;
        } else {
            return log_string;
        }
    }

    async function split_domain_list(site_config, domain_list, separator) {// 分离域名列表
        /* ！！！为什么 var site 放在此处 site_config.site 里全都变成最后一次 push 的 site */

        /* 分离域名列表 */
        domain_list = domain_list.split(separator);

        for (var cnt = 0; cnt < domain_list.length; cnt++) {
            var site = {
                succeed: false,// 上一步是否成功
                domain: '',// 域名在 site_config.site 中的索引
                url: {
                    get: '',
                    post: '',
                },
            };

            site.domain = domain_list[cnt];
            site.url.get = site.domain + site_config.dir.log_in;
            site.url.post = site.domain + site_config.dir.sign_in;

            /* 压入 site_config 中的 site 类 */
            site_config.site.push(site);
        }
    }

    async function split_keyword_list(site_config, keyword_list, separator) {// 分离关键字列表
        /* 分离关键词列表 */
        keyword_list = keyword_list.split(separator);

        /* 压入 site_config 中的 keyword.positive 类 */
        for (var cnt = 0; cnt < keyword_list.length; cnt++) {
            site_config.keyword.positive.push(keyword_list[cnt]);
        }
    }

    async function load_param(site_config, param) {// 加载界面引入的参数
        /* 分离域名列表 */
        await split_domain_list(site_config, param.domain, ',');

        /* 分离关键字列表 */
        await split_keyword_list(site_config, param.keyword_positive, ',');
    }

    async function check_online_site(site, keyword) {// 检查网址是否在线
        /* 获取登录信息 */
        var { data } = await axios.get(site.url.get);

        /* 创建用于匹配规则的变量 */
        var cnt = 0;
        var mismatch = 0;

        /* 判断 online 的关键词 ，应存在的 */
        for (cnt = 0; cnt < keyword.positive.length; cnt++) {
            if (!RegExp(keyword.positive[cnt]).test(data)) {
                mismatch = mismatch + 1;
            }
        }

        /* 判断 online 的关键词 ，不应存在的 */
        for (cnt = 0; cnt < keyword.negative.length; cnt++) {
            if (RegExp(keyword.negative[cnt]).test(data)) {
                mismatch = mismatch + 1;
            }
        }

        /* 返回不匹配数量的反 */
        return Boolean(!mismatch);
    }

    async function check_online(site_config, param) {// 检查所有网址是否在线
        /* 加载配置参数 */
        await load_param(site_config, param);

        /* 检测网址是否在线 */
        var offline = 0;
        for (var cnt = 0; cnt < site_config.site.length; cnt++) {
            /* 检查是否在线 */
            if (!await check_online_site(site_config.site[cnt], site_config.keyword)) {
                await record_log(cnt, 1, '未登录');
                offline = offline + 1;
            } else {
                site_config.site[cnt].online = true;
            }
        }

        /* 返回在线数量的布尔值 */
        return Boolean(!offline);
    }

    async function sign_in(site_config, param) {// 签到
        /* 检测网址是否在线  */
        await check_online(site_config, param);
        for (var cnt = 0; cnt < site_config.site.length; cnt++) {
            /* 检查上一步是否成功，即本站点是否在线 */
            if (!site_config.site[cnt].succeed) {
                continue;
            }

            /* 推送签到信息 */
            var { data } = await axios.post(site_config.site[cnt].url.post);
            await record_log(cnt, 0, data.msg);
        }

        /* 打印日志 */
        return await view_log(site_config);
    }

    module.exports = function () {// 引出接口
        return {
            sign_in: sign_in,// 签到接口
            check_online: check_online,// 检查是否在线接口
        };
    }
})();

exports.run = async function (param) {
};

exports.check = async function (param) {
};