// ==UserScript==
// @name              mmc
// @namespace         https://soulsign.inu1255.cn/scripts/218
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/mmc
// @version           1.2.8
// @author            Miao-Mico
// @expire            2000000
// @domain            *.*
// @domain            *.*.*
// ==/UserScript==

(function () {
    const about = {
        author: "M-M", // 作者
        version: "1.2.8", // 版本
        licence: "Apache-2.0 License", // 许可
        trademark: "❤️ mmc ❤️", // 标志
    }; // 关于

    var runtime = false; // 是否是运行时

    var debugs = {
        enable: false, // 是否开启
        system: [], // 存放系统日志
    }; // 调试

    var asserts = {
        domain: { site: false, param: false },
        path: { site: { log_in: false, sign_in: false } },
        keyword: { site: { positive: false, negative: false }, param: false },
        hook: { get_log_in: false, post_sign_in: false },
    }; // 断言

    var urls = {
        site: [],
        path: { log_in: [], sign_in: [] },
    }; // 网址

    var logs = {
        level: 0, // 是否有异常或错误
        pool: [], // 存放网站日志
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
        positive: [], // 应该存在的
        negative: [], // 不应该存在的
        mismatch: [], // 不匹配的
    }; // 关键字

    var configs = {
        site: {}, // 网站配置
        param: {}, // 参数配置
    }; // 传入的参数

    var pipes = []; // 管道

    async function system_log(object, code, message) {
        if (debugs.enable) {
            /* 压入系统日志 */
            debugs.system.push({
                index: debugs.system.length,
                object: object,
                code: code,
                message: message,
            });

            /* 抛出系统错误 */
            if (/system/.test(object) && code) {
                throw about.trademark + " ⁉️ " + message;
            }

            console.log({
                index: debugs.system.length,
                object: object,
                code: code,
                message: message,
            });
        }

        return message;
    } // 系统日志

    async function debug(level = 0) {
        if (debugs.enable) {
            return {
                runtime: runtime,
                debug: level >= 2 ? debugs : {},
                assert: asserts,
                config: level >= 3 ? configs : {},
                url: level >= 1 ? urls : {},
                keyword: keywords,
                pipe: level >= 2 ? pipes : {},
                hook: level >= 1 ? hooks : {},
                log: logs,
            };
        } else {
            return (
                about.trademark +
                " ⁉️ " +
                "部分数据可能未记录。" +
                "请尝试 var xxx = require(site_config.core), xxx = xxx(site_config, param_config, true); 并刷新！"
            );
        }
    } // 调试

    async function config_variable(variable, template) {
        variable.length = 0;
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            variable.push(await template());
        }
    } // 配置变量

    async function publish_pipe(site, data) {
        if (parseInt(pipes.length) <= parseInt(site.index)) {
            pipes.push({ index: site.index, data: data });
        } else {
            pipes[site.index].data = data;
        }

        await system_log("publish_pipe()", 0, { index: site.index, data: data });
        return data;
    } // 发布管道信息

    async function subscribe_pipe(site) {
        await system_log("subscribe_pipe()", 0, pipes[site.index]);

        return pipes[site.index].data;
    } // 订阅管道信息

    async function record_log(site, code, message) {
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

        /* 记录异常或错误等级 */
        logs.level = 0;
        for (let index = 0; index < logs.pool.length; index++) {
            logs.level = logs.level + logs.pool[index].code;
        }
        await system_log("record_log()", 0, `log levels: ${logs.level}`);

        return message;
    } // 记录日志

    async function view_log(level = 0) {
        await system_log("view_log()", 0, `debugs enable: ${debugs.enable}`);

        if (debugs.enable) {
            return await debug(level);
        } else {
            let log_string = about.trademark;

            /* 从索引转换到域名 */
            for (let cnt = 0; cnt < logs.pool.length; cnt++) {
                /* 非完整时跳过正确的 */
                if (!level && !logs.pool[cnt].code) {
                    continue;
                }

                /* 格式化输出 */
                log_string = log_string.concat(
                    logs.pool[cnt].code ? " ❗ " : " ✔ ",
                    urls.site[cnt].domain + ": " + logs.pool[cnt].message
                );
            }

            /* 决定通知强度 */
            if (Boolean(logs.level)) {
                throw log_string;
            } else {
                return log_string;
            }
        }
    } // 打印日志

    async function config_hook() {
        /* 配置 get_log_in */
        if (asserts.hook.get_log_in) {
            hooks.get_log_in = configs.site.hook.get_log_in;

            await system_log("config_hook()", 0, "hook get_log_in");
        }

        /* 配置 post_sign_in */
        if (asserts.hook.post_sign_in) {
            hooks.post_sign_in = configs.site.hook.post_sign_in;

            await system_log("config_hook()", 0, "hook post_sign_in");
        }
    } // 配置钩子

    async function handle_hook(hook, site) {
        /* 复制变量，防止影响外部 */
        const const_site = site;
        const const_param = configs.param;
        await system_log("handle_hook()", 0, { hook: hook, site: const_site });

        /* hook */
        return await hook(const_site, const_param);
    } // 处理钩子函数

    async function assert(site_config, param_config) {
        async function assert_item_group(item_group, message, callback) {
            let match = {
                regulation: {
                    undefined: { code: 0, box: [] },
                    null: { code: 0, box: [] },
                },
                operation: {
                    pass: async function (index) {
                        return !(
                            match.regulation.undefined.box[index] + match.regulation.null.box[index]
                        );
                    },
                    alarm: async function (null_trigger = 0, callback = async function (match) {}) {
                        if (
                            parseInt(item_group.length) <= parseInt(match.regulation.undefined.code)
                        ) {
                            await system_log("system", 1, `${message} 缺失`);
                        } else if (
                            parseInt(null_trigger ? null_trigger : item_group.length) <=
                            parseInt(match.regulation.null.code)
                        ) {
                            await system_log("system", 1, `${message} 为空`);
                        }

                        await system_log("alarm()", 0, callback);
                        await callback(match, message);
                    },
                },
            }; // 匹配数

            async function match_regulation(hook, regulation) {
                let boolean_reg = false;

                for (let index = 0; index < item_group.length; index++) {
                    boolean_reg = await hook(item_group[index]);

                    regulation.box.push(boolean_reg);
                    regulation.code = regulation.code + boolean_reg;
                }

                await system_log("match_regulation()", 0, regulation);
            } // 匹配规则

            /* 匹配规则 */
            await match_regulation(async function (item) {
                return "undefined" == typeof item;
            }, match.regulation.undefined);

            await match_regulation(async function (item) {
                return !item || !item.length;
            }, match.regulation.null);

            await system_log("assert_item_group()", 0, {
                message: message,
                length: {
                    item_group: item_group.length,
                    undefined: match.regulation.undefined.code,
                    null: match.regulation.null.code,
                },
            });

            /* 回调 */
            await callback(match.operation);

            await system_log("assert_item_group()", 0, {
                item_group: item_group,
                message: message,
                callback: callback,
            });
        } // 断言类型

        try {
            /* 断言域名 */
            await assert_item_group(
                [site_config.domain, param_config.domain],
                "domain",
                async function (operation) {
                    await operation.alarm();

                    asserts.domain.site = await operation.pass(0);
                    asserts.domain.param = await operation.pass(1);
                }
            );

            /* 断言路径 */
            await assert_item_group(
                [site_config.path.log_in, site_config.path.sign_in],
                "path",
                async function (operation) {
                    await operation.alarm(1);

                    asserts.path.site.log_in = await operation.pass(0);
                    asserts.path.site.sign_in = await operation.pass(1);
                }
            );

            /* 断言关键字 */
            await assert_item_group(
                [
                    site_config.keyword.positive,
                    site_config.keyword.negative,
                    param_config.keyword_positive,
                ],
                "keyword",
                async function (operation) {
                    await operation.alarm(2, async function (match, message) {
                        if (match.regulation.null.box[1])
                            await system_log("system", 1, `${message} 为空`);
                    });

                    asserts.keyword.site.positive = await operation.pass(0);
                    asserts.keyword.site.negative = await operation.pass(1);
                    asserts.keyword.param = await operation.pass(2);
                }
            );

            /* 断言钩子 */
            await assert_item_group(
                [site_config.hook.get_log_in, site_config.hook.post_sign_in],
                "hook",
                async function (operation) {
                    asserts.hook.get_log_in = await operation.pass(0);
                    asserts.hook.post_sign_in = await operation.pass(1);
                }
            );
        } catch (error) {
            if (/TypeError/.test(error.name)) {
                let table = [
                    { member: "hook", regexp: ["get_log_in", "post_sign_in"] },
                    { member: "path", regexp: ["log_in", "sign_in"] },
                    { member: "keyword", regexp: ["positive", "negative"] },
                ];

                for (let index = 0; index < table.length; index++) {
                    for (let idx = 0; idx < table[index].regexp.length; idx++) {
                        if (RegExp(table[index].regexp[idx]).test(error.message)) {
                            await system_log(
                                "system",
                                1,
                                `site_config.${table[index].member} 缺失`
                            );
                        }
                    }
                }
            } else {
                throw error;
            }
        }

        /* 获取参数列表 */
        configs.site = site_config;
        configs.param = param_config;
    } // 断言

    async function config_url(separator = ",") {
        async function config_domain(domain_list) {
            let site_length = urls.site.length,
                scheme_regexp = "",
                domain_regexp = "";

            for (let index = 0; index < domain_list.length; index++) {
                try {
                    let match_cd = domain_list[index].match(/((\w+):\/\/)([^/:]+)/);
                    await system_log("config_domain()", 0, match_cd);
                    scheme_regexp = match_cd[2];
                    domain_regexp = match_cd[3];
                } catch (error) {
                    scheme_regexp = "https";
                    domain_regexp = domain_list[index];
                } // 匹配 http(s)://xxx

                let site = {
                    index: index + site_length, // 索引
                    scheme: scheme_regexp, // 协议
                    domain: domain_regexp, // 域名
                    path: { log_in: 0, sign_in: 0 }, // 路径
                    url: { get: "", post: "" }, // 网址
                };

                /* 压入 domain 中 */
                urls.site.push(site);
                await system_log("config_domain()", 0, site);
            }

            await system_log("config_domain()", 0, domain_list);
        } // 配置网站

        async function config_path(path_list) {
            let path_local = [],
                path_regexp = "";

            for (let priority = 0; priority < path_list.length; priority++) {
                let match_cp = path_list[priority].match(/(\/*)([^# ]*)/);
                await system_log("config_path()", 0, match_cp);
                path_regexp = match_cp[2];

                let path = { priority: priority, data: path_regexp };

                path_local.push(path);
                await system_log("config_path()", 0, path);
            }

            return await system_log("config_path()", 0, path_local);
        }

        /* 清空网址 */
        urls.site.length = 0;
        urls.path.log_in.length = 0;
        urls.path.sign_in.length = 0;

        /* 配置路径 */
        urls.path.log_in = await config_path(configs.site.path.log_in);
        urls.path.sign_in = await config_path(configs.site.path.sign_in);

        /* 分离域名列表 */
        if (asserts.domain.site) {
            await config_domain(configs.site.domain);
            await system_log("config_url()", 0, "config configs.site.domain");
        }

        if (asserts.domain.param) {
            let domain_list = configs.param.domain.split(separator);
            await config_domain(domain_list);
            await system_log("config_url()", 0, "config configs.param.domain");
        }

        await system_log("config_url()", 0, {
            config: configs,
            url: urls,
            separator: separator,
        });
    } // 分离域名列表

    async function config_keyword(separator = ",") {
        async function config_type(type, keyword_list) {
            for (let index = 0; index < keyword_list.length; index++) {
                type.push(keyword_list[index]);
            }
        }

        /* 清空列表 */
        keywords.positive.length = 0;
        keywords.negative.length = 0;
        keywords.mismatch.length = 0;

        /* 配置关键字 */
        if (asserts.keyword.site) {
            config_type(keywords.positive, configs.site.keyword.positive);
            config_type(keywords.negative, configs.site.keyword.negative);

            await system_log("config_keyword()", 0, "config configs.site.keyword");
        }

        if (asserts.keyword.param) {
            config_type(keywords.positive, configs.param.keyword_positive.split(separator));

            await system_log("config_keyword()", 0, "config configs.param.keyword_positive");
        }
    } // 加载关键字列表

    async function update_config(site_config, param_config) {
        /* 断言参数 */
        await assert(site_config, param_config);

        /* 分离域名 */
        await config_url();

        /* 分离关键字 */
        await config_keyword();

        /* 配置钩子 */
        await config_hook();

        /* 配置管道 */
        await config_variable(pipes, async function () {
            return { index: 0, data: "" };
        });

        /* 配置日志 */
        await config_variable(logs.pool, async function () {
            return { index: 0, code: 0, message: "" };
        });
    } // 更新配置

    async function update_url(site, method, next = false) {
        if (/get/.test(method)) {
            site.url.get = `${site.scheme}://${site.domain}/${
                urls.path.log_in[site.path.log_in].data
            }`;

            if (next) site.path.log_in++;
        } else if (/post/.test(method)) {
            site.url.post = `${site.scheme}://${site.domain}/${
                urls.path.sign_in[site.path.sign_in].data
            }`;

            if (next) site.path.sign_in++;
        }

        await system_log("update_url()", 0, { method: method, site: site });
    } // 更新 url

    async function method_site(site, method, path, hook, error) {
        /* 推送签到信息 */
        let data_ms = { code: true, data: "" },
            next = false;

        for (let cnt = 0; cnt < path.length; cnt++) {
            try {
                await update_url(site, method, next);
                data_ms = await handle_hook(hook, site);

                await record_log(site, data_ms.code, data_ms.data);

                return await system_log("method_site()", 0, data_ms);
            } catch (error) {
                if (/TypeError/.test(error)) {
                    await record_log(site, 1, error + "-" + error);

                    next = true;
                    continue;
                } else {
                    throw error;
                }
            }
        } // 选择 path

        return data_ms;
    }

    async function check_online_site(site) {
        /* 获取网站返回信息 */
        let data_cos = await method_site(
            site,
            "get",
            urls.path.log_in,
            hooks.get_log_in,
            "检查在线状态失败"
        );

        if (!data_cos.code) {
            async function match_keyword_list(keyword_list, property) {
                let boolean_mkl = /positive/.test(property) ? false : true;

                for (index = 0; index < keyword_list.length; index++) {
                    if (boolean_mkl == RegExp(keyword_list[index]).test(data_cos.data)) {
                        keywords.mismatch.push({
                            domain: site.domain,
                            property: property,
                            keyword: keyword_list[index],
                        });

                        await record_log(
                            site,
                            keywords.mismatch.length,
                            `mismatch ${property} keyword: ${keyword_list[index]}`
                        );
                    }
                }
            }

            data_cos = data_cos.data;
            keywords.mismatch.length = 0;

            /* 判断 online 的关键词 ，应存在的 */
            await match_keyword_list(keywords.positive, "positive");

            /* 判断 online 的关键词 ，不应存在的 */
            await match_keyword_list(keywords.negative, "negative");

            await record_log(
                site,
                keywords.mismatch.length,
                keywords.mismatch.length ? "未登录" : "已登录"
            );
        }

        /* 返回不匹配数量的反 */
        return Boolean(!keywords.mismatch.length);
    } // 检查网址是否在线

    async function sign_in_site(site) {
        /* 检查上一步是否成功，即本站点是否在线 */
        if (!logs.pool[site.index].code) {
            /* 推送签到信息 */
            let data_sis = await method_site(
                site,
                "post",
                urls.path.sign_in,
                hooks.post_sign_in,
                "推送签到信息失败"
            );
        }
    }

    async function check_online() {
        /* 检测网址是否在线 */
        let offline = 0;
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            offline = offline + !(await check_online_site(urls.site[cnt]));
        }
        await system_log("check_online()", 0, `check online for urls, offline: ${offline}`);

        /* 返回在线数量的布尔值 */
        return Boolean(!offline);
    } // 检查所有网址是否在线

    async function sign_in(full_log = false) {
        /* 检测网址是否在线  */
        await check_online();

        /* 网址签到 */
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            await sign_in_site(urls.site[cnt]);
        }

        /* 打印日志 */
        return await view_log(full_log);
    } // 签到

    module.exports = async function (site_config, param_config, debug_enable = false) {
        /* 使能调试 */
        debugs.enable = debug_enable;

        /* 更新配置 */
        await update_config(site_config, param_config);

        return {
            about: about, // 关于
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
