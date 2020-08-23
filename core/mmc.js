// ==UserScript==
// @name              mmc
// @namespace         https://soulsign.inu1255.cn/scripts/218
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/mmc
// @version           1.2.15
// @author            Miao-Mico
// @expire            2000000
// @domain            *
// @grant             eval
// ==/UserScript==

(function () {
    const about = {
        author: "M-M", // 作者
        version: "1.2.15", // 版本
        licence: "Apache-2.0 License", // 许可
        trademark: "❤️ mmc ❤️", // 标志
    }; // 关于

    const system = "system";

    let soulsign = {
        detail: false, // 是否支持细节列表
    };

    var debugs = {
        enable: false, // 是否开启
        system: [], // 存放系统日志
        exception: [],
    }; // 调试

    var asserts = {
        domain: { site: false, param: false },
        path: { site: {}, param: {} },
        keyword: { site: {}, param: {} },
        hook: {},
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
        type: 5,
    }; // 钩子

    var keywords = {
        mismatch: [], // 不匹配的
        online: [], // 在线的
        signed: [], // 签过到的
        signing: [], // 正签过的
    }; // 关键字

    var configs = {
        site: {}, // 网站配置
        param: {}, // 参数配置
    }; // 传入的参数

    var pipes = []; // 管道

    async function system_log_core(object, code, message) {
        let date = new Date();

        if (debugs.enable) {
            let log = {
                id: {
                    index: debugs.system.length,
                    timestamp: `${date.toLocaleString()}:${date.getSeconds()}.${date.getMilliseconds()}`,
                },
                object: object,
                code: code,
                message: message,
            };

            /* 打印系统日志 */
            console.log(log);

            /* 压入系统日志 */
            debugs.system.push(log);
        }

        return message;
    }

    async function system_notify(level, summary, detail = []) {
        await system_log_core("system_notify()", 0, { level: level, message: detail });

        let package = {};

        if (debugs.exception.length) {
            level += 1;
            package = about.trademark + `${soulsign.detail ? "</br>" : " "}` + JSON.stringify(debugs.exception);
        } else if (!soulsign.detail) {
            package = about.trademark;
            for (let idx = 0; idx < detail.length; idx++) {
                let item = detail[idx];
                package += ` ${item.errno ? "❗" : "✔"} ${item.domain}: ${item.message}`;
            }
        } else {
            package = { summary: `${about.trademark}</br>` + summary, detail };
        }

        if (level) {
            throw package;
        } else {
            return package;
        }
    }

    async function system_log(object, code, message) {
        /* 抛出系统错误 */
        if (system === object && code) {
            debugs.exception.push(message);
        }

        return await system_log_core(object, code, message);
    } // 系统日志

    async function debug(level = 0) {
        if (debugs.enable) {
            return {
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
            await system_notify(
                1,
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

    async function record_log(site, code, message, persistence = false) {
        if (parseInt(logs.pool.length) <= parseInt(site.index)) {
            logs.pool.push({
                index: site.index,
                code: code,
                message: message,
                persistence: [persistence ? message : ""],
            });
        } else if (false === code || 0 === code || Number(logs.pool[site.index].code) <= Number(code)) {
            /* 修改为最新 log */
            logs.pool[site.index].code = code;
            logs.pool[site.index].message = message;

            if (persistence) {
                logs.pool[site.index].persistence.push(message);
            } // 持久化当前消息
        } // 只有等级够了才能覆写

        /* 记录异常或错误等级 */
        logs.level = 0;
        for (let index = 0; index < logs.pool.length; index++) {
            logs.level = logs.level + logs.pool[index].code;
        }

        await system_log("record_log()", 0, { domain: site.domain, levels: logs.level, message: message });

        return message;
    } // 记录日志

    async function persistence_log(site) {
        let persistence_pl = logs.pool[site.index].persistence;
        return persistence_pl[persistence_pl.length - 1];
    } // 取出持久化的消息

    async function view_log(level = 0) {
        await system_log("view_log()", 0, `debugs enable: ${debugs.enable}`);

        let summary = "",
            detail = [],
            ok = 0;

        /* 从索引转换到域名 */
        for (let cnt = 0; cnt < logs.pool.length; cnt++) {
            let item = {
                url: urls.site[cnt],
                pool: logs.pool[cnt],
            };

            /* 非完整时跳过正确的 */
            if (!item.pool.code) {
                ok++;

                if (!level) continue;
            }

            detail.push({
                domain: item.url.domain,
                url: item.pool.code ? urls.site[cnt].url.get : `${item.url.scheme}://${item.url.domain}`,
                errno: item.pool.code,
                message: item.pool.message,
                log: item.pool.persistence,
            });
        }

        summary = `成功: ${ok} 失败: ${logs.pool.length - ok}`;

        if (debugs.enable) {
            detail = { debug: await debug(level), notify: { level: logs.level, summary, detail } };
        }

        return await system_notify(logs.level, summary, detail);
    } // 打印日志

    async function operate_table(table, operator = async function (item, index) {}, argument = []) {
        let table_ot = [];

        for (let index = 0; index < table.length; index++) {
            table_ot.push(await operator(table[index], index, argument));
        }

        return table_ot;
    }

    async function operate_item(index, table, operator = async function (item, index) {}) {
        return await operator(table[index], index);
    }

    async function assert(site_config, param_config) {
        async function assert_table(config_table, assert_table, message, alarm_table) {
            async function match_regulation(hook, regulation) {
                let boolean_reg = false;

                for (let index = 0; index < config_table.length; index++) {
                    boolean_reg = await hook(config_table[index]);

                    regulation.box.push(boolean_reg);
                    regulation.code = regulation.code + boolean_reg;
                }

                await system_log("match_regulation()", 0, regulation);
            } // 匹配规则

            let match = {
                regulation: {
                    undefined: { code: 0, box: [] },
                    null: { code: 0, box: [] },
                },
                operation: {
                    pass: async function (index) {
                        return !(match.regulation.undefined.box[index] + match.regulation.null.box[index]);
                    },
                    alarm: async function (table = []) {
                        if (config_table.length <= match.regulation.undefined.code) {
                            await system_log(system, 1, `${message} 缺失`);
                        } else if (config_table.length <= match.regulation.null.code) {
                            await system_log(system, 1, `${message} 为空`);
                        }

                        await system_log("alarm()", 0, table);

                        await operate_table(table, async function (item) {
                            let result_alarm = await operate_table(item.box, async function (itm) {
                                return Number(eval(`match.regulation.${itm}`));
                            });

                            await system_log("operate_table()", 0, result_alarm);

                            for (let index = 1; index < result_alarm.length; index++) {
                                result_alarm[0] = result_alarm[index] + result_alarm[0];
                            }

                            if (eval(`${item.trigger} < ${result_alarm[0]}`)) {
                                await system_log("system", 1, `${message}.${item.message}`);
                            }
                        });
                    },
                },
            }; // 匹配数

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
                    item_group: config_table.length,
                    undefined: match.regulation.undefined.code,
                    null: match.regulation.null.code,
                },
            });

            await match.operation.alarm(alarm_table);

            for (let idx = 0; idx < assert_table.length; idx++) {
                eval(`asserts.${assert_table[idx]} = ${await match.operation.pass(idx)}`);
            }

            await system_log("assert_item_group()", 0, {
                item_group: config_table,
                message: message,
            });
        } // 断言类型

        try {
            await operate_table(
                [
                    {
                        config: [site_config.domain, param_config.domain],
                        assert: [`domain.site`, `domain.param`],
                        message: "domain",
                        alarm: [],
                    },
                    {
                        config: [
                            site_config.path.log_in,
                            site_config.path.sign_in,
                            param_config.path_log_in,
                            param_config.path_sign_in,
                        ],
                        assert: [`path.site.log_in`, `path.site.sign_in`, `path.param.sign_in`, `path.param.sign_in`],
                        message: "path",
                        alarm: [
                            { box: ["null.box[0]", "null.box[2]"], trigger: 1, message: `log_in 为空` },
                            { box: ["null.box[1]", "null.box[3]"], trigger: 1, message: `sign_in 为空` },
                        ],
                    },
                    {
                        config: [
                            site_config.keyword.online,
                            site_config.keyword.signed,
                            site_config.keyword.signing,
                            param_config.keyword_online,
                            param_config.keyword_signed,
                            param_config.keyword_signing,
                        ],
                        assert: [
                            `keyword.site.online`,
                            `keyword.site.signed`,
                            `keyword.site.signing`,
                            `keyword.param.online`,
                            `keyword.param.signed`,
                            `keyword.param.signing`,
                        ],
                        message: "keyword",
                        alarm: [{ box: ["null.box[0]", "null.box[3]"], trigger: 1, message: `online 为空` }],
                    },
                    {
                        config: [
                            site_config.hook.get_log_in,
                            site_config.hook.post_sign_in,
                            site_config.hook.notify_signed,
                            site_config.hook.notify_signing,
                            site_config.hook.filter_unbefitting,
                        ],
                        assert: [
                            `hook.get_log_in`,
                            `hook.post_sign_in`,
                            `hook.notify_signed`,
                            `hook.notify_signing`,
                            `hook.filter_unbefitting`,
                        ],
                        message: "hook",
                        alarm: [
                            { box: ["null.box[0]"], trigger: 0, message: `get_log_in 为空` },
                            { box: ["null.box[1]"], trigger: 0, message: `post_sign_in 为空` },
                        ],
                    },
                ],
                async function (item) {
                    await assert_table(item.config, item.assert, item.message, item.alarm);
                }
            );
        } catch (exception) {
            if (/TypeError/.test(exception.name)) {
                let table = [
                    {
                        member: "hook",
                        regexp: [
                            "get_log_in",
                            "post_sign_in",
                            "hook.notify_signed",
                            "hook.notify_signing",
                            "hook.filter_unbefitting",
                        ],
                    },
                    { member: "path", regexp: ["log_in", "sign_in"] },
                    { member: "keyword", regexp: ["online", "signed"] },
                ];

                for (let index = 0; index < table.length; index++) {
                    for (let idx = 0; idx < table[index].regexp.length; idx++) {
                        if (RegExp(table[index].regexp[idx]).test(exception.message)) {
                            await system_log("system", 1, `site_config.${table[index].member} 缺失`);
                        }
                    }
                }
            } else {
                await system_log(system, 1, exception);
            }
        }

        /* 获取参数列表 */
        configs.site = site_config;
        configs.param = param_config;

        await system_log("assert()", 0, { assert: asserts, config: configs });
    } // 断言

    async function config_hook() {
        let hooked = 0;

        await operate_table(
            [
                { type: "get_log_in", default: {} },
                { type: "post_sign_in", default: {} },
                {
                    type: "notify_signed",
                    default: async function () {
                        return { code: 0 };
                    },
                },
                {
                    type: "notify_signing",
                    default: async function () {
                        return { code: 0 };
                    },
                },
                {
                    type: "filter_unbefitting",
                    default: async function () {
                        return { code: 0 };
                    },
                },
            ],
            async function (item, index) {
                let hook_ch = {
                    index: index,
                    function: item.default,
                };

                if (eval(`asserts.hook.${item.type}`)) {
                    hook_ch.function = eval(`configs.site.hook.${item.type}`);
                    await system_log("config_hook()", 0, { function: hook_ch.function.toString(), hook: hook_ch });
                    await system_log("config_hook()", 0, `hook ${item.type}`);
                    hooked++;
                }

                eval(`hooks.${item.type} = hook_ch`);
            }
        );

        await system_log("config_hook()", 0, `hooked: ${hooked}`);
    } // 配置钩子

    async function handle_hook(hook, site, argument = []) {
        if (hooks.type <= hook.index) {
            await system_log(system, 1, "没有这个 hook");
        }

        let persistence_hh = await persistence_log(site),
            data_hh = "";

        /* 配置参数 */
        await operate_item(
            hook.index,
            [["site", "configs.param"], ["site", "configs.param", `persistence_hh`], [], [], [`persistence_hh`]],
            async function (item) {
                for (let index = 0; index < item.length; index++) {
                    eval(`argument.push(${item[index]})`);
                }

                await system_log("handle_hook()", 0, {
                    hook: { index: hook.index, function: hook.function.toString() },
                    site: site,
                    item: item,
                    argument: argument,
                });
            }
        );

        /* 执行钩子 */
        try {
            data_hh = await hook.function(argument[0], argument[1], argument[2], argument[3]);
        } catch (exception) {
            if (!!exception.message) exception = exception.message;
            await record_log(site, 5, `.hook.${hook.function.name}(): ${exception}`, true);
        }

        /* 排查传入参数有没有被修改，然后返回 */
        await system_log("handle_hook()", 0, argument);
        return await system_log("handle_hook()", 0, data_hh);
    } // 处理钩子函数

    async function config_url(separator = ",") {
        async function config_domain(domain) {
            let site_length = urls.site.length,
                scheme_regexp = "",
                domain_regexp = "";

            for (let index = 0; index < domain.length; index++) {
                try {
                    let match_cd = domain[index].match(/((\w+):\/\/)([^/:]+)/);
                    await system_log("config_domain()", 0, match_cd);
                    scheme_regexp = match_cd[2];
                    domain_regexp = match_cd[3];
                } catch (exception) {
                    scheme_regexp = "https";
                    domain_regexp = domain[index];
                } // 匹配 http(s)://xxx

                let site_cd = {
                    index: index + site_length, // 索引
                    scheme: scheme_regexp, // 协议
                    domain: domain_regexp, // 域名
                    path: { log_in: 0, sign_in: 0 }, // 路径
                    url: { get: "", post: "" }, // 网址
                };

                /* 压入 domain 中 */
                urls.site.push(site_cd);
                await system_log("config_domain()", 0, site_cd);
            }
        } // 配置网站

        async function config_path(path = { type: "", config: [] }) {
            for (let priority = 0; priority < path.config.length; priority++) {
                try {
                    let path_cp = { priority: priority, data: path.config[priority].match(/(\/*)([^# ]*)/)[2] };

                    eval(`urls.path.${path.type}`).push(await system_log("config_path()", 0, path_cp));
                } catch (exception) {
                    await system_log(system, 1, { exception, func: "config_path()" });
                }
            }
        } // 配置路径

        /* 清空 urls */
        urls.site.length = 0;
        urls.path.log_in.length = 0;
        urls.path.sign_in.length = 0;

        /* 配置路径 */
        await operate_table(
            [
                { assert: "site.log_in", type: "log_in", config: "site.path.log_in" },
                { assert: "site.sign_in", type: "sign_in", config: "site.path.sign_in" },
                { assert: "param.log_in", type: "log_in", config: "param.path_log_in.split(separator)" },
                { assert: "param.sign_in", type: "sign_in", config: "param.path_sign_in.split(separator)" },
            ],
            async function (item) {
                if (eval(`asserts.path.${item.assert}`)) {
                    await config_path({ type: item.type, config: eval(`configs.${item.config}`) });
                    await system_log("config_url()", 0, `config path.${item.assert}`);
                }
            }
        );

        /* 配置网站 */
        await operate_table(
            [
                { assert: "site", type: "log_in", config: "site.domain" },
                { assert: "param", type: "sign_in", config: "param.domain.split(separator)" },
            ],
            async function (item) {
                if (eval(`asserts.domain.${item.assert}`)) {
                    await config_domain(eval(`configs.${item.config}`));
                    await system_log("config_url()", 0, `config ${item.type}`);
                }
            }
        );

        await system_log("config_url()", 0, {
            config: configs,
            url: urls,
            separator: separator,
        });
    } // 分离域名列表

    async function config_keyword(separator = ",") {
        async function config_type(type, keyword_list) {
            for (let index = 0; index < keyword_list.length; index++) {
                try {
                    type.push(RegExp(keyword_list[index].match(/\/(.*)\//)[1]));
                } catch (exception) {
                    type.push(keyword_list[index]);
                }
            }
        }

        /* 清空列表 */
        keywords.mismatch.length = 0;
        keywords.online.length = 0;
        keywords.signed.length = 0;
        keywords.signing.length = 0;

        /* 配置关键字 */
        await operate_table(
            [
                { keyword: "online", assert: "param.online", config: "param.keyword_online.split(separator)" },
                { keyword: "signed", assert: "param.signed", config: "param.keyword_signed.split(separator)" },
                { keyword: "signing", assert: "param.signing", config: "param.keyword_signing.split(separator)" },
                { keyword: "online", assert: "site.online", config: "site.keyword.online" },
                { keyword: "signed", assert: "site.signed", config: "site.keyword.signed" },
                { keyword: "signing", assert: "site.signing", config: "site.keyword.signing" },
            ],
            async function (item) {
                if (eval(`asserts.keyword.${item.assert}`)) {
                    config_type(eval(`keywords.${item.keyword}`), eval(`configs.${item.config}`));
                    await system_log("config_keyword()", 0, `config ${item.config}`);
                }
            }
        );

        await system_log("config_keyword()", 0, keywords);
    } // 加载关键字列表

    async function update_config(site_config, param_config, debug_enable) {
        /* 使能调试 */
        debugs.enable = debug_enable;
        debugs.system.length = 0;
        debugs.exception.length = 0;

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
            return { index: 0, code: 0, message: "", persistence: [] };
        });
    } // 更新配置

    async function update_url(site, method, next = false) {
        const table_uu = [
            { method: "get", url: "get", path: "log_in" },
            { method: "post", url: "post", path: "sign_in" },
        ];
        let item_uu = table_uu[0];

        /* 查表 */
        for (let index = 0; index < method.length; index++) {
            item_uu = table_uu[index];

            if (RegExp(method).test(item_uu.method)) {
                break;
            }
        }

        let index = eval(`next ? ++site.path.${item_uu.path} : site.path.${item_uu.path}`),
            path = eval(`urls.path.${item_uu.path}[${index}].data`),
            url = `${site.scheme}://${site.domain}/${path}`;
        eval(`site.url.${item_uu.url} = url`);

        await system_log("update_url()", 0, { method: method, item: item_uu, site: site, next: next });
    } // 更新 url

    async function method_site(
        site,
        method,
        path,
        hook,
        message,
        match = async function (site, data) {
            return true;
        }
    ) {
        /* 推送签到信息 */
        let data_ms = { code: true, data: "" },
            boolean_ms = false,
            update = false;

        for (let cnt = 0; cnt < path.length; cnt++) {
            try {
                await update_url(site, method, update);

                data_ms = await handle_hook(hook, site);
                await system_log("method_site()", 0, `hook? ${data_ms.code}`);

                await record_log(site, data_ms.code, data_ms.data, true);
                boolean_ms = await match(site, data_ms);
                await system_log("method_site()", 0, `match? ${boolean_ms}`);

                update = data_ms.code || boolean_ms;
            } catch (exception) {
                if (/TypeError/.test(exception)) {
                    await record_log(site, 1, message);

                    update = true;
                } else {
                    await system_log(system, 1, { exception, func: "method_site()" });
                }
            } finally {
                await system_log("method_site()", 0, `update? ${update}`);

                if (!update) {
                    break;
                }
            }
        } // 选择 path

        return await system_log("method_site()", 0, boolean_ms);
    }

    async function match_keyword(site, data, keyword, property, message, notify = async function () {}) {
        let matches_mkl = keyword.length;
        let boolean_mk = undefined;

        for (let index = 0; index < keyword.length; index++) {
            let array_mkl = data.match(RegExp(keyword[index])),
                match_mkl = Boolean(array_mkl);

            await system_log("match_keyword()", 0, `${property.name}.${keyword[index]} match? ${match_mkl}`);

            if (match_mkl) {
                /* 个性化通知文字 */
                await system_log("match_keyword()", 0, (boolean_mk = await notify(array_mkl, message)));

                break;
            } else {
                /* 收集不匹配信息 */
                keywords.mismatch.push({
                    domain: site.domain,
                    property: property,
                    keyword: keyword[index],
                });

                matches_mkl--;
            }
        }

        if (undefined === boolean_mk) boolean_mk = property.positive ? !matches_mkl : !!matches_mkl;
        await record_log(site, boolean_mk, message[Number(boolean_mk)]);
        return await system_log("match_keyword()", 0, boolean_mk);
    }

    async function check_online_site(site) {
        /* 获取网站返回信息 */
        let boolean_cos = await method_site(
            site,
            "get",
            urls.path.log_in,
            hooks.get_log_in,
            "检查在线状态失败",
            async function (site, data) {
                let data_cos = await handle_hook(hooks.filter_unbefitting, site);

                if (!data_cos.code) {
                    /* 判断 是否在线 的关键词 ，应存在的 */
                    return await match_keyword(
                        site,
                        data.data.data,
                        keywords.online,
                        { name: "online", positive: true },
                        ["已登录", "未登录"]
                    );
                } else {
                    await record_log(site, data_cos.code, data_cos.message || "不适配");
                    return true;
                }
            }
        );

        /* 返回是否在线 */
        await system_log("check_online_site()", 0, `${site.domain} online? ${!boolean_cos}`);
        return !boolean_cos;
    } // 检查网址是否在线

    async function sign_in_site(site) {
        let boolean_sis = false;

        /* 检查上一步是否成功，即本站点是否在线 */
        if (!logs.pool[site.index].code) {
            if (keywords.signed.length) {
                let persistence_sis = await system_log("sign_in_site()", 0, await persistence_log(site));

                if (!!persistence_sis) {
                    boolean_sis = !(await match_keyword(
                        site,
                        persistence_sis.data,
                        keywords.signed,
                        { name: "signed", positive: true },
                        ["已签到", "未签到"],
                        async function (array, message) {
                            let data_mk_nsd = await handle_hook(hooks.notify_signed, site, [array]);
                            if (!!data_mk_nsd.data) message[Number(data_mk_nsd.code)] = data_mk_nsd.data;
                            return data_mk_nsd.code;
                        }
                    ));
                }
            } // 检查是否已签到

            /* 判断是否已经签到 */
            if (!boolean_sis) {
                await system_log("sign_in_site()", 0, `${site.domain} signed? ${boolean_sis}`);

                boolean_sis = await method_site(
                    site,
                    "post",
                    urls.path.sign_in,
                    hooks.post_sign_in,
                    "推送签到信息失败",
                    async function (site, data) {
                        let boolean_ms_p = false;
                        if (asserts.keyword.site.signing || asserts.keyword.param.signing) {
                            let message = await persistence_log(site);

                            /* 判断 警告消息 的关键词 */
                            boolean_ms_p = await match_keyword(
                                site,
                                data.data,
                                keywords.signing,
                                { name: "signing", positive: true },
                                ["签到成功", "签到失败"],
                                async function (array, message) {
                                    let data_mk_nsg = await handle_hook(hooks.notify_signing, site, [array]);
                                    if (!!data_mk_nsg.data) message[Number(data_mk_nsg.code)] = data_mk_nsg.data;
                                    return data_mk_nsg.code;
                                }
                            );
                        }

                        return boolean_ms_p;
                    }
                );
            }
        }

        /* 返回是否签到成功 */
        await system_log("sign_in_site()", 0, `${site.domain} sign in? ${!boolean_sis}`);
        return boolean_sis;
    }

    async function check_online() {
        /* 检测网址是否在线 */
        let offline = 0;
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            offline = offline + !(await check_online_site(urls.site[cnt]));
        }

        /* 返回在线数量的布尔值 */
        await system_log("check_online()", 0, `offline: ${offline}`);
        return Boolean(!offline);
    } // 检查所有网址是否在线

    async function sign_in(full_log = false) {
        /* 检测网址是否在线  */
        await check_online();

        /* 网址签到  */
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            await sign_in_site(urls.site[cnt]);
        }

        /* 打印日志 */
        return await view_log(full_log);
    } // 签到

    module.exports = async function (site_config, param_config, config = {}) {
        config = Object.assign({ dbe: false, ssv: false }, config);

        /* 是否支持细节 */
        if ("function" == typeof config.ssv) {
            soulsign.detail = Boolean(0 <= (await config.ssv("2.1.0")));
        }

        /* 更新配置 */
        await update_config(site_config, param_config, config.dbe);

        return {
            about: about, // 关于
            debug: debug, // 调试
            record_log: record_log, // 记录日志
            persistence_log: persistence_log, // 提取持久化日志
            view_log: view_log, // 记录日志
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
