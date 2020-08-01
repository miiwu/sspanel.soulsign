// ==UserScript==
// @name              mmc
// @namespace         https://soulsign.inu1255.cn/scripts/218
// @updateURL         https://soulsign.inu1255.cn/script/Miao-Mico/mmc
// @version           1.2.10
// @author            Miao-Mico
// @expire            2000000
// @domain            *.*
// @domain            *.*.*
// @grant             eval
// ==/UserScript==

(function () {
    const about = {
        author: "M-M", // 作者
        version: "1.2.10", // 版本
        licence: "Apache-2.0 License", // 许可
        trademark: "❤️ mmc ❤️", // 标志
    }; // 关于

    const emphasizes = { correct: "✔", system_fault: "⁉️", site_error: "❗" };

    const system = "system";

    var runtime = false; // 是否是运行时

    var debugs = {
        enable: false, // 是否开启
        system: [], // 存放系统日志
    }; // 调试

    var asserts = {
        domain: { site: false, param: false },
        path: { site: {} },
        keyword: { site: {}, param: false },
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
        type: 2,
        get_log_in: {}, // 获取网址登录信息
        post_sign_in: {}, // 推送网址签到信息
    }; // 钩子

    var keywords = {
        mismatch: [], // 不匹配的
        online: [], // 在线的
        signed: [], // 签过到的
    }; // 关键字

    var configs = {
        site: {}, // 网站配置
        param: {}, // 参数配置
    }; // 传入的参数

    var pipes = []; // 管道

    async function system_log_core(object, code, message) {
        if (debugs.enable) {
            let log = {
                index: debugs.system.length,
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

    async function system_format({ object = system, code = 0, message = "" }) {
        let string_sf = "";

        for (let cnt = 0; cnt < arguments.length; cnt++) {
            let format = {
                emphasize: "",
                object: "",
                message: "",
            };

            try {
                let emphasize = 0;
                if (RegExp(system).test(arguments[cnt].object.toString())) {
                    if (arguments[cnt].code) {
                        emphasize = emphasizes.system_fault;
                    }
                } else {
                    format.object = `${arguments[cnt].object.domain}: `;

                    if (arguments[cnt].code) {
                        emphasize = emphasizes.site_error;
                    }
                }

                if (!arguments[cnt].code) {
                    emphasize = emphasizes.correct;
                }

                format.emphasize = ` ${emphasize} `;
                format.message = arguments[cnt].message;
            } catch (exception) {
                format.emphasize = "";
                format.object = "";
                format.message = arguments[cnt];
            } // 读取格式

            await system_log_core("system_format()", 0, format);

            /* 格式化输出 */
            string_sf = string_sf.concat(format.emphasize, format.object, format.message);
        }

        return await system_log_core("system_format()", 0, string_sf);
    }

    async function system_notify(level, message = { object: system, code: 0, message: "" }) {
        let string_sn = about.trademark + (await system_format(message));

        await system_log_core("system_notify()", 0, { level: level, message: message });

        if (level) {
            throw string_sn;
        } else {
            return string_sn;
        }
    }

    async function system_log(object, code, message) {
        /* 抛出系统错误 */
        if (RegExp(system).test(object)) {
            await system_notify(code, message);
        }

        return await system_log_core(object, code, message);
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
                persistence: persistence ? message : "",
            });
        } else {
            /* 修改为最新 log */
            logs.pool[site.index].code = code;
            logs.pool[site.index].message = message;

            if (persistence) {
                logs.pool[site.index].persistence = message;
            } // 持久化当前消息
        }

        /* 记录异常或错误等级 */
        logs.level = 0;
        for (let index = 0; index < logs.pool.length; index++) {
            logs.level = logs.level + logs.pool[index].code;
        }
        await system_log("record_log()", 0, { domain: site.domain, levels: logs.level, message: message });

        return message;
    } // 记录日志

    async function persistence_log(site) {
        return logs.pool[site.index].persistence;
    } // 取出持久化的消息

    async function view_log(level = 0) {
        await system_log("view_log()", 0, `debugs enable: ${debugs.enable}`);

        let log_string = "";

        /* 从索引转换到域名 */
        for (let cnt = 0; cnt < logs.pool.length; cnt++) {
            /* 非完整时跳过正确的 */
            if (!level && !logs.pool[cnt].code) {
                continue;
            }

            /* 格式化输出 */
            log_string = log_string.concat(
                await system_format({
                    object: urls.site[cnt],
                    code: logs.pool[cnt].code,
                    message: logs.pool[cnt].message,
                })
            );
        }

        if (debugs.enable) {
            return { debug: await debug(level), notify: { level: logs.level, message: log_string } };
        } else {
            return await system_notify(logs.level, log_string);
        }
    } // 打印日志

    async function config_hook() {
        let table_ch = ["get_log_in", "post_sign_in"],
            hooked = 0;

        for (let index = 0; index < hooks.type; index++) {
            if (eval(`asserts.hook.${table_ch[index]}`)) {
                let hook_ch = {
                    index: index,
                    function: eval(`configs.site.hook.${table_ch[index]}`),
                };

                eval(`hooks.${table_ch[index]} = hook_ch`);

                await system_log("config_hook()", 0, { function: hook_ch.function.toString(), hook: hook_ch });
                await system_log("config_hook()", 0, `hook ${table_ch[index]}`);

                hooked++;
            }
        }

        await system_log("config_hook()", 0, `hooked: ${hooked}`);
    } // 配置钩子

    async function handle_hook(hook, site) {
        if (hooks.type <= hook.index) {
            await system_log(system, 1, "没有这个 hook");
        }

        /* 复制变量，防止影响外部 */
        const argument = { site: site, param: configs.param };

        await system_log("handle_hook()", 0, {
            hook: { index: hook.index, function: hook.function.toString() },
            argument: argument,
        });

        /* 执行 hook */
        let data_hh = await hook.function(argument.site, argument.param);
        return await system_log("handle_hook()", 0, data_hh);
    } // 处理钩子函数

    async function assert(site_config, param_config) {
        async function assert_item_group(item_group, message, callback) {
            async function match_regulation(hook, regulation) {
                let boolean_reg = false;

                for (let index = 0; index < item_group.length; index++) {
                    boolean_reg = await hook(item_group[index]);

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
                    alarm: async function (null_trigger = 0, callback = async function (match) {}) {
                        if (parseInt(item_group.length) <= parseInt(match.regulation.undefined.code)) {
                            await system_log(system, 1, `${message} 缺失`);
                        } else if (
                            parseInt(null_trigger ? null_trigger : item_group.length) <=
                            parseInt(match.regulation.null.code)
                        ) {
                            await system_log(system, 1, `${message} 为空`);
                        }

                        await system_log("alarm()", 0, callback);
                        await callback(match, message);
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
            await assert_item_group([site_config.domain, param_config.domain], "domain", async function (operation) {
                await operation.alarm();

                asserts.domain.site = await operation.pass(0);
                asserts.domain.param = await operation.pass(1);
            });

            /* 断言路径 */
            await assert_item_group([site_config.path.log_in, site_config.path.sign_in], "path", async function (
                operation
            ) {
                await operation.alarm(1);

                asserts.path.site.log_in = await operation.pass(0);
                asserts.path.site.sign_in = await operation.pass(1);
            });

            /* 断言关键字 */
            await assert_item_group(
                [site_config.keyword.online, site_config.keyword.signed, param_config.keyword_online],
                "keyword",
                async function (operation) {
                    await operation.alarm(2, async function (match, message) {
                        if (match.regulation.null.box[1]) {
                            await system_log("system", 1, `${message} 为空`);
                        }
                    });

                    asserts.keyword.site.online = await operation.pass(0);
                    asserts.keyword.site.signed = await operation.pass(1);
                    asserts.keyword.param = await operation.pass(2);
                }
            );

            /* 断言钩子 */
            await assert_item_group(
                [site_config.hook.get_log_in, site_config.hook.post_sign_in],
                "hook",
                async function (operation) {
                    await operation.alarm(2);

                    asserts.hook.get_log_in = await operation.pass(0);
                    asserts.hook.post_sign_in = await operation.pass(1);
                }
            );
        } catch (exception) {
            if (/TypeError/.test(exception.name)) {
                let table = [
                    { member: "hook", regexp: ["get_log_in", "post_sign_in"] },
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
                throw exception;
            }
        }

        /* 获取参数列表 */
        configs.site = site_config;
        configs.param = param_config;

        await system_log("assert()", 0, { assert: asserts, config: configs });
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
                } catch (exception) {
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
        keywords.online.length = 0;
        keywords.signed.length = 0;
        keywords.mismatch.length = 0;

        /* 配置关键字 */
        if (asserts.keyword.site) {
            config_type(keywords.online, configs.site.keyword.online);
            config_type(keywords.signed, configs.site.keyword.signed);

            await system_log("config_keyword()", 0, "config configs.site.keyword");
        }

        if (asserts.keyword.param) {
            config_type(keywords.online, configs.param.keyword_online.split(separator));

            await system_log("config_keyword()", 0, "config configs.param.keyword_online");
        }

        await system_log("config_keyword()", 0, keywords);
    } // 加载关键字列表

    async function update_config(site_config, param_config, debug_enable) {
        /* 使能调试 */
        debugs.enable = debug_enable;

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

        let path = eval(
                `urls.path.${item_uu.path}[next ? site.path.${item_uu.path}++ : site.path.${item_uu.path}].data`
            ),
            url = `${site.scheme}://${site.domain}/${path}`;
        eval(`site.url.${item_uu.url} = url`);

        await system_log("update_url()", 0, { method: method, item: item_uu, site: site });
    } // 更新 url

    async function method_site(site, method, path, hook, message) {
        /* 推送签到信息 */
        let data_ms = { code: true, data: "" },
            next = false;

        for (let cnt = 0; cnt < path.length; cnt++) {
            try {
                await update_url(site, method, next);
                data_ms = await handle_hook(hook, site);

                await record_log(site, data_ms.code, data_ms.data, true);
                break;
            } catch (exception) {
                if (/TypeError/.test(exception)) {
                    await record_log(site, 1, message);

                    next = true;
                    continue;
                } else {
                    throw exception;
                }
            }
        } // 选择 path

        return await system_log("method_site()", 0, data_ms);
    }

    async function match_keyword_list(site, data, keyword_list, property, message) {
        let string_mkl = "",
            mismatch_mkl = false,
            mismatches_mkl = 0;

        for (let index = 0; index < keyword_list.length; index++) {
            try {
                let array_mkl = data.match(RegExp(keyword_list[index]));

                string_mkl = `${array_mkl[0]}`;
                mismatch_mkl = false;
            } catch (exception) {
                if (/TypeError/.test(exception)) {
                    keywords.mismatch.push({
                        domain: site.domain,
                        property: property,
                        keyword: keyword_list[index],
                    });

                    string_mkl = `mismatch ${property} keyword: ${keyword_list[index]}`;
                    mismatch_mkl = true;
                    mismatches_mkl++;
                } else {
                    throw exception;
                }
            }

            await system_log(site, mismatch_mkl, string_mkl);
        }

        await record_log(site, mismatches_mkl, message[Number(!!mismatches_mkl)]);

        return await system_log("match_keyword_list()", 0, mismatches_mkl);
    }

    async function check_online_site(site) {
        /* 获取网站返回信息 */
        let data_cos = await method_site(site, "get", urls.path.log_in, hooks.get_log_in, "检查在线状态失败");

        if (!data_cos.code) {
            /* 判断 是否在线 的关键词 ，应存在的 */
            await match_keyword_list(site, data_cos.data.data, keywords.online, "online", ["已登录", "未登录"]);
        }

        /* 返回不匹配数量的反 */
        await system_log("check_online_site()", 0, `${site.domain} online? ${!keywords.mismatch.length}`);
        return Boolean(!keywords.mismatch.length);
    } // 检查网址是否在线

    async function sign_in_site(site) {
        let data_sis = { code: 0, data: "" };

        /* 检查上一步是否成功，即本站点是否在线 */
        if (!logs.pool[site.index].code) {
            let persistence_sis = await system_log("sign_in_site()", 0, await persistence_log(site));

            /* 判断 是否已经签过到 的关键词 ，应存在的 */
            if (await match_keyword_list(site, persistence_sis.data, keywords.signed, "signed", ["已签到", "未签到"])) {
                /* 推送签到信息 */
                data_sis = await method_site(site, "post", urls.path.sign_in, hooks.post_sign_in, "推送签到信息失败");
            }
        }

        await system_log("sign_in_site()", 0, `${site.domain} sign in? ${!data_sis.code}`);
        return data_sis.code;
    }

    async function check_online() {
        /* 检测网址是否在线 */
        let offline = 0;
        for (let cnt = 0; cnt < urls.site.length; cnt++) {
            offline = offline + !(await check_online_site(urls.site[cnt]));
        }

        await system_log("check_online()", 0, `offline: ${offline}`);

        /* 返回在线数量的布尔值 */
        return Boolean(!offline);
    } // 检查所有网址是否在线

    async function sign_in(full_log = false) {
        /* 检测网址是否在线  */
        if (await check_online()) {
            /* 网址签到 */
            for (let cnt = 0; cnt < urls.site.length; cnt++) {
                await sign_in_site(urls.site[cnt]);
            }
        }

        /* 打印日志 */
        return await view_log(full_log);
    } // 签到

    module.exports = async function (site_config, param_config, debug_enable = false) {
        /* 更新配置 */
        await update_config(site_config, param_config, debug_enable);

        return {
            about: about, // 关于
            debug: debug, // 调试
            record_log: record_log, // 记录日志
            persistence_log: persistence_log, // 提取持久化日志
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
