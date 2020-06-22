import tools from './utils/tools/index';

const app = {
	globalData: {
		httpUrl: 'http://172.0.0.1:7003'
	},
	onLaunch(e) {
		tools.init(this);
	},
	onLoad(options) {},
	onShow() {},
	onHide() {},
};

/* 常用混合器 */
app.mixin = { ...minxins };

App(app);
