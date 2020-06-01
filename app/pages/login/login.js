
let app = getApp();

/* page原生钩子及生命周期 */
let NAVTIVE_NETHODS = {
    data: {},
    watch: {},
    onReady() { },
    onLoad(options) {
        /* 存储路由及参数到storage, 以便用于callback */
        app.storeRoute(); 
        /* 给page添加与VUE相似的watch属性 */
        app.expand.setWatcher(this.data, this.watch);
    },
    onShow() { },
    onShareAppMessage() {
        /* 全局分享配置,如果是自定义 */
        return app.config.share
    },
    onHide() { },
    onPullDownRefresh() {console.log('下拉触底')},
    onReachBottom() { console.log('下拉触底') },
    onPageScroll(e) { },
}


/** 自定义方法 */
let CUSTOM_NETHODS = {
    todo(e) {
        // 自定义方法获取传入的参数
        let params = app.tools.getParams(e);
    },
}

/* 自定义方法注入到page */
app.tools.setParams(NAVTIVE_NETHODS, CUSTOM_NETHODS);

/**
 * ajax方法注入到page, 直接可以调用 例如：this.getSign().then(res => { todo... })
 * 此方法慎用，以免覆盖本页面的方法
 * app.includeRequestList(NAVTIVE_NETHODS);
 */


console.log(NAVTIVE_NETHODS, '最終page')
Page(NAVTIVE_NETHODS)