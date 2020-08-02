var post_sign_in = {
    signing: {
        data: { ret: 0, msg: "获得了 100 MB 流量." },
    }, // 正在签到的
    signed: {
        data: { ret: 0, msg: "您似乎已经签到过了..." },
        status: 200,
        statusText: "",
        headers: {
            "cf-cache-status": "DYNAMIC",
            "cf-ray": "xxxxxxxxxxxxxxxx-ABC",
            "cf-request-id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "content-encoding": "br",
            "content-type": "text/html; charset=UTF-8",
            date: "Tue, 02 Aug 2020 00:00:00 GMT",
            "expect-ct": 'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
            server: "cloudflare",
            status: "200",
        },
        config: {
            url: "https://suying999.net/user/checkin",
            method: "post",
            headers: { Accept: "application/json, text/plain, */*" },
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
