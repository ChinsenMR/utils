const app = getApp();


Page(app.$page({
	data: {
		list: [],
	},
	watch: {},
	setAllData() {
		app.tools.setAllData(this, this.data);
	},
	onReady() {},
	onLoad(options) {
		console.log(this.data.static)
		app.tools.setWatcher(this.data, this.watch);
		this.setData({
			params: options
		});

	},
	onShow() {
		this.getList();
		this.getList();
	},
	onShareAppMessage() {
		return {
			title: '首页'
		}
	},
	onHide() {},
	onPullDownRefresh() {
		console.log('下拉触底');
	},
	onReachBottom() {
		console.log('下拉触底');
	},
	onPageScroll(e) {},
	/**
	 * 自定义方法全部放这里
	 */
	methods: {
		/* 获取列表 */
		getList() {
			app.$api.getGoodsList().then(res => {
				if (res.errCode == 1) {
					this.setData({
						list: res.data
					})
				}
			})
		},
	},
}));