// ==UserScript==
// @name              sspanel.mmc
// @namespace         https://soulsign.inu1255.cn/scripts/213
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/sspanel.mmc
// @version           1.2.4
// @author            Miao-Mico
// @expire            2000000
// @domain            sspanel
// @domain            ssr
// @domain            v2ray
// @domain            *
// ==/UserScript==

(function () {
    var runtime = false; // 是否是运行时

    var debugs = {
        enable: false,
        system: [],
    };

    var asserts = {
        domain: { site_config: false, param_config: false },
        keyword: { site_config: { positive: false, negative: false }, param_config: false },
        hook: { get_log_in: false, post_sign_in: false },
    }; // 断言

    var sites = []; // 网址

    var logs = {
        active: true, // 是否记录
        level: 0, // 是否有异常或错误
        sites: 0,
        pool: [],
    }; // 日志

    var hooks = {
        get_log_in: async function (site, param) {
            /* 获取登录信息 */
            return { code: 0, data: await axios.get(site.url.get) };
        }, // 获取网址登录信息
        post_sign_in: async function (site, param) {
            /* 推送签到信息 */
            let data_psi = await axios.post(site.url.post);

            /* 返回信息 */
            return { code: 0, data: data_psi.data.msg };
        }, // 推送网址签到信息
    }; // 钩子

    var keywords = {
        positive: [],
        negative: [],
        mismatch: [],
    }; // 关键字

    var configs = {
        site_config: {},
        param_config: {},
    }; // 传入的参数

    var pipes = [];

    async function system_log(object, code, message) {
        if (debugs.enable) {
            debugs.system.push({
                index: debugs.system.length,
                object: object,
                code: code,
                message: message,
            });

            if (/system/.test(object) && code) {
                throw "❤️ sspanel.mmc ❤️" + " ⁉️ " + message;
            }
        }
    }

    async function debug(level = 0) {
        if (debugs.enable) {
            return {
                runtime: runtime,
                debug: level >= 2 ? debugs : {},
                assert: asserts,
                config: level >= 3 ? configs : {},
                site: level >= 1 ? sites : {},
                keyword: keywords,
                pipe: level >= 1 ? pipes : {},
                hook: level >= 1 ? hooks : {},
                log: logs,
            };
        } else {
            return (
                "❤️ sspanel.mmc ❤️" +
                " ⁉️ " +
                "部分数据可能未记录，请尝试 var xxx = require(site_config.core), xxx = xxx(site_config, param_config, true); 并刷新！"
            );
        }
    } // 调试用

    async function create_time(something) {
        let pipe;

        if (!runtime) {
            pipe = something();
        }

        runtime = runtime + 1;

        return pipe;
    } // 运行时前

    async function publish_pipe(which, message) {
        await system_log("system", 0, "publish_pipe(): publish the pipes");

        if (parseInt(pipes.length) <= parseInt(which)) {
            pipes.push({ index: which, data: message });
        } else {
            pipes[which].data = message;
        }

        await system_log("system", 0, `{ which: ${which}, message: ${message.toString()} }`);
        return message;
    } // 发布管道信息

    async function subscribe_pipe(which) {
        await system_log("system", 0, "subscribe_pipe(): subscribe the pipes");

        return pipes[which].data;
    } // 订阅管道信息

    async function config_log() {
        await system_log("system", 0, "config_log(): config the logs");

        logs.sites = sites.length;

        /* 生成对应 sites 的日志包 */
        logs.pool.length = 0;
        for (let cnt = 0; cnt < sites.length; cnt++) {
            logs.pool.push({
                index: cnt,
                code: 0,
                message: "",
            });
        }

        await system_log("system", 0, logs.pool);
    } // 配置日志

    async function active_log(whether) {
        await system_log("system", 0, "active_log(): active the logs");
        await system_log("system", 0, `active: ${whether}`);

        logs.active = whether;
    } // 激活日志记录

    async function record_log(site, code, message) {
        await system_log("system", 0, "record_log(): record the logs");

        if (logs.active) {
            await system_log(site, code, message);

            if (parseInt(logs.pool.length) <= parseInt(site.index)) {
                logs.pool.push({
                    index: site.index,
                    code: code,
                    message: message,
                });
            } else {
                /* 修改为最新 log */
                logs.pool[site.index].code = code;
                logs.pool[site.index].message = message;
            }
        }

        /* 记录异常或错误状态 */
        logs.level = 0;
        for (let index = 0; index < logs.sites; index++) {
            logs.level = logs.level + logs.pool[index].code;
        }

        return message;
    } // 记录日志

    async function view_log() {
        if (debugs.enable) {
            return await debug();
        } else {
            let log_string = "❤️ sspanel.mmc ❤️";

            /* 从索引转换到域名 */
            for (let cnt = 0; cnt < logs.sites; cnt++) {
                /* 如果成功 */
                if (logs.pool[cnt].code) {
                    /* 格式化输出 */
                    log_string = log_string + " ❗ ";
                    log_string = log_string + sites[cnt].domain;
                    log_string = log_string + ": ";
                    log_string = log_string + logs.pool[cnt].message;
                } else {
                    continue;
                }
            }

            /* 决定通知强度 */
            if (Boolean(logs.level)) {
                throw log_string;
            } else {
                return log_string;
            }
        }
    } // 打印日志

    async function config_hook(site_config) {
        await system_log("system", 0, "config_hook(): config hooks");

        if (asserts.hook.get_log_in) {
            hooks.get_log_in = site_config.hook.get_log_in;

            await system_log("system", 0, "hook get_log_in");
        }

        if (asserts.hook.post_sign_in) {
            hooks.post_sign_in = site_config.hook.post_sign_in;

            await system_log("system", 0, "hook post_sign_in");
        }
    } // 配置钩子

    async function handle_hook(hook, site, param) {
        await system_log("system", 0, "handle_hook(): handle hooks");

        await system_log("system", 0, `{ hook: ${hook} site: ${site} param: ${param}}`);

        return await hook(site, param);
    } // 处理钩子函数

    async function assert(site_config, param_config) {
        await system_log("system", 0, "assert(): assert input configs");

        async function assert_type(rule, message, callback, alarm = true) {
            let match = {
                undefined: {
                    code: 0,
                    box: [],
                },
                null: {
                    code: 0,
                    box: [],
                },
                enable: async function (index) {
                    return !(match.undefined.box[index] + match.null.box[index]);
                },
            }; // 匹配数

            let boolean = false;
            for (let cnt = 0; cnt < rule.length; cnt++) {
                boolean = "undefined" == typeof rule[cnt];

                match.undefined.box.push(boolean);
                match.undefined.code = match.undefined.code + boolean;
            }

            for (let cnt = 0; cnt < rule.length; cnt++) {
                boolean = !rule[cnt] || !rule[cnt].length;

                match.null.box.push(boolean);
                match.null.code = match.null.code + boolean;
            }

            await system_log(
                "system",
                0,
                `assert ${message} result: ` +
                    `{ rule: ${rule.length} undefined: ${match.undefined.code} null: ${match.null.code} }`
            );

            await callback(match);

            if (alarm) {
                if (parseInt(rule.length) <= parseInt(match.undefined.code)) {
                    await system_log("system", 1, message + " 缺失");
                } else if (rule.length <= match.null.code) {
                    await system_log("system", 1, message + " 为空");
                }
            }

            await system_log("system", 0, `assert ${message} passed`);
        } // 断言类型

        /* 断言域名 */
        await assert_type([site_config.domain, param_config.domain], "domain", async function (
            match
        ) {
            asserts.domain.site_config = await match.enable(0);
            asserts.domain.param_config = await match.enable(1);
        });

        /* 断言关键字 */
        await assert_type(
            [
                site_config.keyword.positive,
                site_config.keyword.negative,
                param_config.keyword_positive,
            ],
            "keyword",
            async function (match) {
                asserts.keyword.site_config.positive = await match.enable(0);
                asserts.keyword.site_config.negative = await match.enable(1);
                asserts.keyword.param_config = await match.enable(2);
            }
        );

        /* 断言钩子 */
        await assert_type(
            [site_config.hook.get_log_in, site_config.hook.post_sign_in],
            "hook",
            async function (match) {
                asserts.hook.get_log_in = await match.enable(0);
                asserts.hook.post_sign_in = await match.enable(1);
            },
            false
        );

        /* 获取参数列表 */
        configs.site_config = site_config;
        configs.param_config = param_config;

        await system_log("system", 0, "assign input configs to configs");
    } // 断言

    async function load_domain_list(site_config, domain_list, separator) {
        await system_log("system", 0, "load_domain_list(): config sites");

        async function config_site(domain_list, dir_list) {
            let site_length = sites.length;

            for (let index = 0; index < domain_list.length; index++) {
                let site = {
                    index: 0, // 索引
                    domain: "", // 域名在 site_config.site 中的索引
                    url: {
                        get: "",
                        post: "",
                    },
                };

                site.index = site_length + index;
                site.domain = domain_list[index];
                site.url.get = site.domain + dir_list.log_in;
                site.url.post = site.domain + dir_list.sign_in;

                /* 压入 sites 中 */
                sites.push(site);
            }
        } // 配置网站

        /* 清空列表 */
        sites.length = 0;
        await system_log("system", 0, "clear sites");

        /* 分离域名列表 */
        if (asserts.domain.site_config) {
            await config_site(site_config.domain, site_config.dir);

            await system_log("system", 0, "push site_config.domain");
        }

        if (asserts.domain.param_config) {
            domain_list = domain_list.split(separator);

            await config_site(domain_list, site_config.dir);

            await system_log("system", 0, "push domain_list");
        }
    } // 分离域名列表

    async function load_keyword_list(site_config, keyword_list, separator) {
        await system_log("system", 0, "load_keyword_list(): config keywords");

        /* 清空列表 */
        keywords.positive.length = 0;
        keywords.negative.length = 0;
        keywords.mismatch.length = 0;
        await system_log("system", 0, "clear keywords");

        if (asserts.keyword.site_config) {
            keywords.positive = site_config.keyword.positive;
            keywords.negative = site_config.keyword.negative;

            await system_log("system", 0, "push site_config.keywords");
        }

        if (asserts.keyword.param_config) {
            /* 分离关键词列表 */
            keyword_list = keyword_list.split(separator);

            for (var cnt = 0; cnt < keyword_list.length; cnt++) {
                keywords.positive.push(keyword_list[cnt]);
            }

            await system_log("system", 0, "push keyword_list");
        }
    } // 加载关键字列表

    async function update_config(site_config, param_config) {
        await system_log("system", 0, `update_config(): update config`);

        /* 断言参数列表 */
        await assert(site_config, param_config);

        /* 分离域名列表 */
        await load_domain_list(site_config, param_config.domain, ",");

        /* 分离关键字列表 */
        await load_keyword_list(site_config, param_config.keyword_positive, ",");

        /* 配置钩子 */
        await config_hook(site_config);

        /* 配置日志 */
        await config_log();
    }

    async function check_online_site(site) {
        await system_log("system", 0, "check_online_site(): check online for single site");

        /* 获取网站返回信息 */
        let data_cos = await handle_hook(hooks.get_log_in, site, configs.param_config);

        await record_log(site, data_cos.code, data_cos.data);

        if (!data_cos.code) {
            data_cos = data_cos.data;

            /* 创建用于匹配规则的变量 */
            let cnt = 0;

            /* 判断 online 的关键词 ，应存在的 */
            keywords.mismatch.length = 0;
            for (cnt = 0; cnt < keywords.positive.length; cnt++) {
                if (!RegExp(keywords.positive[cnt]).test(data_cos.data)) {
                    keywords.mismatch.push({
                        property: "positive",
                        keyword: keywords.positive[cnt],
                    });

                    await record_log(
                        site,
                        keywords.mismatch.length,
                        `mismatch positive keyword: ${keywords.positive[cnt]}`
                    );
                }
            }

            /* 判断 online 的关键词 ，不应存在的 */
            for (cnt = 0; cnt < keywords.negative.length; cnt++) {
                if (RegExp(keywords.negative[cnt]).test(data_cos.data)) {
                    keywords.mismatch.push({
                        property: "negative",
                        keyword: keywords.negative[cnt],
                    });

                    await record_log(
                        site,
                        keywords.mismatch.length,
                        `mismatch negative keyword: ${keywords.negative[cnt]}`
                    );
                }
            }

            await record_log(
                site,
                keywords.mismatch.length,
                keywords.mismatch.length ? "未登录" : "已登录"
            );
        }

        /* 返回不匹配数量的反 */
        return Boolean(!keywords.mismatch.length);
    } // 检查网址是否在线

    async function check_online() {
        await system_log("system", 0, "check_online(): check online for sites");

        /* 检测网址是否在线 */
        let offline = 0;
        for (let cnt = 0; cnt < sites.length; cnt++) {
            /* 检查是否在线 */
            if (!(await check_online_site(sites[cnt]))) {
                await system_log("system", 0, `check online for site: ${sites[cnt]}`);

                offline = offline + 1;
            }
        }
        await system_log("system", 0, `check online for sites, offline: ${offline}`);

        /* 返回在线数量的布尔值 */
        return Boolean(!offline);
    } // 检查所有网址是否在线

    async function sign_in() {
        await system_log("system", 0, "sign_in(): sign in for sites");

        /* 检测网址是否在线  */
        await check_online();
        await system_log("system", 0, "have checked online status for sites");

        for (let cnt = 0; cnt < logs.sites; cnt++) {
            /* 检查上一步是否成功，即本站点是否在线 */
            if (!logs.pool[cnt].code) {
                /* 推送签到信息 */
                let data_si = await handle_hook(
                    hooks.post_sign_in,
                    sites[cnt],
                    configs.param_config
                );

                await record_log(sites[cnt], data_si.code, data_si.data);
            }
        }

        /* 打印日志 */
        return await view_log();
    } // 签到

    module.exports = async function (site_config, param_config, debug_enable = false) {
        /* 使能调试 */
        debugs.enable = debug_enable;

        await create_time(async function () {
            await update_config(site_config, param_config);
        });

        return {
            debug: debug, // 调试
            record_log: record_log, // 记录日志
            update_config: update_config, // 更新配置
            publish_pipe: publish_pipe, // 发布管道信息
            subscribe_pipe: subscribe_pipe, // 订阅管道信息
            check_online: check_online, // 检查是否在线接口
            sign_in: sign_in, // 签到接口
        };
    }; // 导出
})();

exports.run = async function (param) {};

exports.check = async function (param) {};
