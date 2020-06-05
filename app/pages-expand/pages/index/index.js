let app = getApp();

Page(
	app.tools.initPage({
		data: {},
		watch: {},
		onReady() {},
		onLoad(options) {
			/* 存储路由及参数到storage, 以便用于callback */
			app.storeRoute();
			/* 给page添加与VUE相似的watch属性 */
			app.expand.setWatcher(this.data, this.watch);
		},
		onShow() {},
		onShareAppMessage() {
			/* 全局分享配置,如果是自定义 */
			return app.config.share;
		},
		onHide() {},
		onPullDownRefresh() {
			console.log('下拉触底');
		},
		onReachBottom() {
			console.log('下拉触底');
		},
		onPageScroll(e) {},
	})
);
