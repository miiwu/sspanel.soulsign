// ==UserScript==
// @name              sspanel.mmc
// @namespace         https://soulsign.inu1255.cn/scripts/213
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc
// @version           1.2.1
// @author            Miao-Mico
// @expire            2000000
// @domain            sspanel
// @domain            ssr
// @domain            v2ray
// @domain            *
// ==/UserScript==

(function () {
    var runtime = false; // 是否是运行时

    var sites = []; // 网址

    var logs = {
        active: true, // 是否记录
        level: 0, // 是否有异常或错误
        sites: 0,
        pool: [],
    }; // 日志

    var hooks = {
        get_log_in: async function (site) {
            /* 获取登录信息 */
            return await axios.get(site.url.get);
        }, // 获取网址登录信息
        post_sign_in: async function (site) {
            /* 推送签到信息 */
            return await axios.post(site.url.post);
        }, // 推送网址签到信息
    }; // 钩子

    var keywords = {
        positive: [],
        negative: [],
    }; // 关键字

    async function debug() {
        return {
            runtime: runtime,
            site: sites,
            keyword: keywords,
            hook: hooks,
            log: logs,
        };
    } // 调试用

    async function create_time(something) {
        var pipe;

        if (!runtime) {
            pipe = something();
        }

        runtime = runtime + 1;

        return pipe;
    } // 运行时前

    async function config_hook(site_config) {
        if (false != site_config.core.hook) {
            hooks = site_config.core.hook;
        }
    } // 配置钩子

    async function handle_hook(hook, site) {
        return await hook(site);
    } // 处理钩子函数

    async function config_log() {
        logs.sites = sites.length;

        /* 生成对应 sites 的日志包 */
        for (var cnt = 0; cnt < sites.length; cnt++) {
            logs.pool.push({
                index: cnt,
                code: 0,
                message: "",
            });
        }
    } // 配置日志

    async function active_log(whether) {
        logs.active = whether;
    } // 激活日志记录

    async function record_log(site, code, message) {
        if (logs.active) {
            if (parseInt(logs.sites) > parseInt(site.index)) {
                /* 修改为最新 log */
                logs.pool[site.index].code = code;
                logs.pool[site.index].message = message;
            }
        }

        /* 记录异常或错误状态 */
        logs.level = 0;
        for (var index = 0; index < logs.sites; index++) {
            logs.level = logs.level + logs.pool[index].code;
        }

        return message;
    } // 记录日志

    async function view_log() {
        var log_string = "❤️ sspanel.mmc ❤️";

        /* 从索引转换到域名 */
        for (var cnt = 0; cnt < logs.sites; cnt++) {
            /* 如果成功 */
            if (logs.pool[cnt].code) {
                /* 格式化输出 */
                log_string = log_string + " ❗ ";
                log_string = log_string + sites[cnt].domain;
                log_string = log_string + ": ";
                log_string = log_string + logs.pool[cnt].message;
            }else{
                continue;
            }
        }

        /* 决定通知强度 */
        if (Boolean(logs.level)) {
            throw log_string;
        } else {
            return log_string;
        }
    } // 打印日志

    async function load_domain_list(site_config, domain_list, separator) {
        /* ！！！为什么 var site 放在此处 site_config.site 里全都变成最后一次 push 的 site */

        /* 分离域名列表 */
        if (!domain_list.length) {
        } else {
            sites.length = 0;

            domain_list = domain_list.split(separator);

            for (var index = 0; index < domain_list.length; index++) {
                var site = {
                    index: 0, // 索引
                    domain: "", // 域名在 site_config.site 中的索引
                    url: {
                        get: "",
                        post: "",
                    },
                };

                site.index = index;
                site.domain = domain_list[index];
                site.url.get = site.domain + site_config.dir.log_in;
                site.url.post = site.domain + site_config.dir.sign_in;

                /* 压入 sites 中 */
                sites.push(site);
            }
        }
    } // 分离域名列表

    async function load_keyword_list(site_config, keyword_list, separator) {
        keywords.positive.length = 0;
        keywords.negative.length = 0;

        for (var cnt = 0; cnt < site_config.keyword.positive.length; cnt++) {
            keywords.positive.push(site_config.keyword.positive[cnt]);
        }

        for (var cnt = 0; cnt < site_config.keyword.negative.length; cnt++) {
            keywords.negative.push(site_config.keyword.negative[cnt]);
        }

        if (!keyword_list.length) {
        } else {
            /* 分离关键词列表 */
            keyword_list = keyword_list.split(separator);

            for (var cnt = 0; cnt < keyword_list.length; cnt++) {
                keywords.positive.push(keyword_list[cnt]);
            }
        }
    } // 加载关键字列表

    async function check_online_site(site) {
        /* 获取网站返回信息 */
        var data_cos = await handle_hook(hooks.get_log_in, site);

        /* 创建用于匹配规则的变量 */
        var cnt = 0;
        var mismatch = 0;

        /* 判断 online 的关键词 ，应存在的 */
        for (cnt = 0; cnt < keywords.positive.length; cnt++) {
            if (!RegExp(keywords.positive[cnt]).test(data_cos.data)) {
                mismatch = mismatch + 1;
            }
        }

        /* 判断 online 的关键词 ，不应存在的 */
        for (cnt = 0; cnt < keywords.negative.length; cnt++) {
            if (RegExp(keywords.negative[cnt]).test(data_cos.data)) {
                mismatch = mismatch + 1;
            }
        }

        await record_log(site, mismatch, mismatch ? "未登录" : "已登录");

        /* 返回不匹配数量的反 */
        return Boolean(!mismatch);
    } // 检查网址是否在线

    async function check_online() {
        /* 检测网址是否在线 */
        var offline = 0;
        for (var cnt = 0; cnt < sites.length; cnt++) {
            /* 检查是否在线 */
            if (!(await check_online_site(sites[cnt]))) {
                offline = offline + 1;
            }
        }

        /* 返回在线数量的布尔值 */
        return Boolean(!offline);
    } // 检查所有网址是否在线

    async function sign_in() {
        /* 检测网址是否在线  */
        await check_online();

        for (var cnt = 0; cnt < logs.sites; cnt++) {
            /* 检查上一步是否成功，即本站点是否在线 */
            if (!logs.pool[cnt].code) {
                /* 推送签到信息 */
                var data_si = await handle_hook(hooks.post_sign_in, sites[cnt]);

                await record_log(sites[cnt], 0, data_si.data.msg);
            }
        }

        /* 打印日志 */
        return await view_log();
    } // 签到

    module.exports = async function (site_config, param) {
        await create_time(async function () {
            /* 分离域名列表 */
            await load_domain_list(site_config, param.domain, ",");

            /* 分离关键字列表 */
            await load_keyword_list(site_config, param.keyword_positive, ",");

            /* 配置钩子 */
            await config_hook(site_config);

            /* 配置日志 */
            await config_log();
        });

        return {
            debug: debug, // 调试
            record_log: record_log, // 记录日志
            sign_in: sign_in, // 签到接口
            check_online: check_online, // 检查是否在线接口
        };
    }; // 导出
})();

exports.run = async function (param) {};

exports.check = async function (param) {};
