/*--authorization--*/
/* 实例化app.js*/
let app = getApp();

/* page原生钩子及生命周期 */
let NATIVE_METHODS = {
    data: {
        callback: '', // 回调路径
    },
    watch: {},
    onReady() { },
    onLoad(options) {
        /* 存储路由及参数到storage, 以便用于callback */
        app.storeRoute();
        /* 给page添加与VUE相似的watch属性 */
        app.expand.setWatcher(this.data, this.watch);
        /* 把应该在onLoad执行的自定义代码统一放在init方法中 */
        this.init(options);

        this.data.callback = options.callback || '/pages/index/index';
    },
    onShow() { },
    onShareAppMessage() {
        /* 全局分享配置,如果是自定义 */
        return app.config.share
    },
    onHide() { },
    onPullDownRefresh() { console.log('下拉刷新') },
    onReachBottom() { console.log('上拉触底') },
    onPageScroll(e) { },
}


/** 自定义方法 */
let CUSTOM_METHODS = {
    /* 初始化方法 */
    init(options) {
        this.getData();
    },
    /* 默认获取数据方法 */
    getData(e) {
        /* 自定义方法获取传入的参数 */
        let params = app.tools.getParams(e);
    },
    /* 授权 */
    onGotUserInfo(e) {
        let that = this,
            res = e.detail

        //用户拒绝授权
        if (res.errMsg != undefined && res.errMsg == 'getUserInfo:fail auth deny') {
            that.promptWechatNoAuth();
            return;
        }
        // 用原生事件处理授权
        wx.request({
            url: app.config.api.domain + '/api/Cis/UserUpdate',
            header: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                'deviceToken': wx.getStorageSync('TOKEN'),
                'deviceType': '32'
            },
            data: {
                n: 'UserUpdate',
                s: wx.getStorageSync('TOKEN'),
                q: {
                    userInfo: res.userInfo,
                    openid: wx.getStorageSync('OPENID'),
                    deviceToken: '未知设备',
                    deviceType: 8
                },
                v: app.config.api.version
            }, method: 'POST',
            success: res => {

                wx.setStorageSync('IS_USER', 1)
                console.log(app.config)
                app.config.switchUrl.forEach(d => {
                    console.log('/' + d)
                    if (that.data.callback == d) {
                        wx.switchTab({ url: '/' + d });
                    } else {
                        wx.redirectTo({ url: '/' + wx.getStorageSync('PAGE') });
                    }
                })

            },
            fail: err => {
                wx.showModal({ content: '授权失败,请重试' });
            }
        })
    },
}

/* 自定义方法注入到page */
app.tools.setParams(NATIVE_METHODS, CUSTOM_METHODS);
/* app.globalData直接注入到data */
app.tools.setGlobalData(NATIVE_METHODS, app.globalData);

/**
 * ajax方法注入到page, 直接可以调用 例如：this.getSign().then(res => { todo... })
 * 此方法慎用，以免覆盖本页面的方法
 * app.includeRequestList(NATIVE_METHODS);
 */


console.log(NATIVE_METHODS, '最終authorization')
Page(NATIVE_METHODS)