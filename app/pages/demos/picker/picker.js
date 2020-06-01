/*--picker--*/
let app = getApp();

/* page原生钩子及生命周期 */
let NATIVE_METHODS = {
    data: {},
    watch: {},
    onReady() { },
    onLoad(options) {
        /* 存储路由及参数到storage, 以便用于callback */
        app.storeRoute(); 
        /* 给page添加与VUE相似的watch属性 */
        app.expand.setWatcher(this.data, this.watch);
        /* 把应该在onLoad执行的自定义代码统一放在init方法中 */
        this.init(options);
    },
    onShow() { },
    onShareAppMessage() {
        /* 全局分享配置,如果是自定义 */
        return app.config.share
    },
    onHide() { },
    onPullDownRefresh() {console.log('下拉刷新')},
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
    }
}

/* 自定义方法注入到page */
app.tools.setParams(NATIVE_METHODS, CUSTOM_METHODS);

/**
 * ajax方法注入到page, 直接可以调用 例如：this.getSign().then(res => { todo... })
 * 此方法慎用，以免覆盖本页面的方法
 * app.includeRequestList(NATIVE_METHODS);
 */


console.log(NATIVE_METHODS, '最終page')
Page(NATIVE_METHODS)