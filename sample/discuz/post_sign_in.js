var post_sign_in = {
    signing: {
        data:
            '<?xml version="1.0" encoding="gbk"?>\r\n<root><![CDATA[<script type="text/javascript" reload="1">\r\nsetTimeout("hideWindow(\'qwindow\')", 3000);\r\n</script>\r\n<div class="f_c">\r\n<h3 class="flb">\r\n<em id="return_win">签到提示</em>\r\n<span>\r\n<a href="javascript:;" class="flbc" onclick="hideWindow(\'qwindow\')" title="关闭">关闭</a></span>\r\n</h3>\r\n<div class="c">\r\n恭喜你签到成功!获得随机奖励 活跃度 178 . </div>\r\n</div>\r\n]]></root>',
    }, // 正在签到的
    signed: {
        data:
            '<?xml version="1.0" encoding="gbk"?>\r\n<root><![CDATA[<script type="text/javascript" reload="1">\r\nsetTimeout("hideWindow(\'qwindow\')", 3000);\r\n</script>\r\n<div class="f_c">\r\n<h3 class="flb">\r\n<em id="return_win">签到提示</em>\r\n<span>\r\n<a href="javascript:;" class="flbc" onclick="hideWindow(\'qwindow\')" title="关闭">关闭</a></span>\r\n</h3>\r\n<div class="c">\r\n您今日已经签到，请明天再来！ </div>\r\n</div>\r\n]]></root>',
        status: 200,
        statusText: "OK",
        headers: {
            "cache-control": "no-store, private, post-check=0, pre-check=0, max-age=0",
            connection: "keep-alive",
            "content-length": "409",
            "content-type": "text/xml; charset=gbk",
            date: "Sun, 02 Aug 2020 00:00:00 GMT",
            expires: "-1",
            pragma: "no-cache",
            server: "nginx/1.8.1",
            "x-powered-by": "PHP/5.6.30",
        },
        config: {
            url: "https://www.chinapyg.com/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1",
            method: "post",
            data: "formhash=abcdefgh&qdxq=kx&qdmode=1&todaysay=%E5%BC%80%E5%BF%83&fastreply=1",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            transformRequest: [null],
            transformResponse: [null],
            timeout: 10000,
            xsrfCookieName: "XSRF-TOKEN",
            xsrfHeaderName: "X-XSRF-TOKEN",
            maxContentLength: -1,
        },
        request: {},
    }, // 已经签到的
};
