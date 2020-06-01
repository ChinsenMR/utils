
let app = getApp();

/* page原生钩子及生命周期 */
let NAVTIVE_NETHODS = {
    data: {
        imageList: [],
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
    },
    onShow() { },
    onShareAppMessage() {
        /* 全局分享配置,如果是自定义 */
        return app.config.share
    },
    onHide() { },
    onPullDownRefresh() { console.log('下拉触底') },
    onReachBottom() { console.log('下拉触底') },
    onPageScroll(e) { },
}


/** 自定义方法 */
let CUSTOM_NETHODS = {
    /* 初始化方法 */
    init(options) {
        this.getData();
    },
    /* 默认获取数据方法 */
    getData(e) {
        /* 自定义方法获取传入的参数 */
        let params = app.tools.getParams(e);

        let ajaxData = { id: 2, ta: { li: 100, page: 1 } };

        app.ajax.getHymDetailList(ajaxData, res => {
            // console.log(res)
            this.data.imageList = res.imageList
            this.setData({ imageList: this.data.imageList })
            this.selectComponent('#viwer').init()
        })
    }
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