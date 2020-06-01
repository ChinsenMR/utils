import store from '../../store'
import create from '../../utils/create'
const app = getApp()

/* page原生钩子及生命周期 */
let NATIVE_METHODS = {
    // app.initData 合并为到data里，便于区分两者
    data: app.initData({
        /**
         * 状态管理
         *  test字段在store.js存在，那么才需要在这里初始化
         * 避免跟data里的数据冲突
         */
        store: {
            test: null,
            motto: null,
            userInfo: null,
            hasUserInfo: null,
            node: null,
            canIUse: null,
            b: {
                arr: []
            },
            firstName: null,
            lastName: null,
            pureProp: null,
        },
        /* data等于当前页面的data */
        data: {
            motto: null,
            test: 333
        },
    }),

    watch: {},
    onReady() {},
    onLoad(options) {
        /* 存储路由及参数到storage, 以便用于callback */
        app.storeRoute();
        /* 给page添加与VUE相似的watch属性 */
        app.expand.setWatcher(this.data, this.watch);
        /* 把应该在onLoad执行的自定义代码统一放在init方法中 */
    },
    onShow() {},
    onShareAppMessage() {
        /* 全局分享配置,如果是自定义 */
        return app.config.share
    },
    onHide() {},
    onPullDownRefresh() {
        console.log('下拉刷新')
    },
    onReachBottom() {
        console.log('上拉触底')
    },
    onPageScroll(e) {},
}


/** 自定义方法 */
let CUSTOM_METHODS = {

    changeStatus(e) {
        this.update({
            test: Math.random() * 15555
        });
    },
}

/* 自定义方法注入到page */
Object.assign(NATIVE_METHODS, CUSTOM_METHODS);
/* app.globalData直接注入到data */
app.tools.setGlobalData(NATIVE_METHODS, app.globalData);

/**
 * ajax方法注入到page, 直接可以调用 例如：this.getSign().then(res => { todo... })
 * 此方法慎用，以免覆盖本页面的方法
 * app.includeRequestList(NATIVE_METHODS);
 */
create(store, NATIVE_METHODS)