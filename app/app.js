import tools from './utils/tools/index';
import minxins from './mixins/index';

const app = {
	globalData: {},
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
