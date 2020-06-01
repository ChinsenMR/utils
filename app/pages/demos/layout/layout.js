
let app = getApp();

/* page原生钩子及生命周期 */
let NAVTIVE_NETHODS = {
    data: {
        layoutList: [], // 数据
        page: 0, // 分页
        limit: 8, // 每页条数
        isLastPage: false, // 是否为最后一页
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
    onPullDownRefresh() {
        console.log('下拉触底')
        this.getList();
    },
    onReachBottom() {
        console.log('下拉触底')
        this.getList();
    },
    onPageScroll(e) { },
}


/** 自定义方法 */
let CUSTOM_NETHODS = {
    /* 初始化 */
    init(options) {
        this.getList();
    },
    /* 获取分页数据 */
    getList(currentPage) {

        if (currentPage) {
            this.data.page = currentPage;
            this.data.layoutList = [];
            this.data.isLastPage = false;
        }

        if (this.data.isLastPage) { return }

        this.data.page++

        let params = {}
        params.id = 394;
        params.ta = {
            pa: currentPage || this.data.page,
            li: this.data.limit
        }

        app.ajax.getCityworksList(params, res => {
            // 拿到结果
            let result = res.worksList;
            // 计算最终条数
            let maxPage = Math.ceil(Number(res.total) / Number(this.data.limit)) || 1;
            // 判断是否是最后一页
            if (this.data.page - 1 >= maxPage) {
                this.data.isLastPage = true;
            }
            // 处理数据
            result.forEach(item => {
                item.num = app.tools.tranCount(item.num)
                this.data.layoutList.push(item)
            })
            // 最终结果
            this.setData({
                page: this.data.page,
                layoutList: this.data.layoutList,
                isLastPage: this.data.isLastPage
            })
            // 初始化瀑布流
            this.selectComponent('#layout').init();

            wx.stopPullDownRefresh()
        })


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