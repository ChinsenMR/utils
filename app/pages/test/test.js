import store from '../../store';
import create from '../../utils/create';
import { test } from '../../utils/store/stores/test';

const app = getApp();

const init = app.tools.initPage({
	data: {
		motto: null,
		test: 333,
	},
	store,
	watch: {},
	setAllData() {
		app.tools.setAllData(this, this.data);
	},
	onReady() {},
	onLoad(options) {
		app.tools.setWatcher(this.data, this.watch);
		this.setData({ params: options });
	},
	onShow() {
		// this.getAgencyList();
	},
	onShareAppMessage() {},
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
		getAgencyList() {
			wx.$api.getAgencyList().then((res) => {
				if (res.errCode == 0) {
					this.setData({
						list: res.resultData,
					});
				}
			});
		},
	},
});

create(init);
