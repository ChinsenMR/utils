module.exports = {
	/* 私有方法 */
	/* 获取当前页面 */
	_currentPage() {
		const pages = getCurrentPages();
		return pages[pages.length - 1];
	},

	/* 输入 */
	inputValue(e) {
		const that = this._currentPage();
		const {
			currentTarget: {
				dataset: { name },
			},
			detail: { value },
		} = e;

		that.setData({ [`form${name}`]: value });
	},

	/* 清除一个对象中所有的值 */
	clearValue(e) {
		const that = this._currentPage();

		const {
			currentTarget: {
				dataset: { form = e } /* 别觉得奇怪，e就是在生命周期调用，传入的值为对象 */,
			},
		} = e;

		form = e.currentTarget ? that.data.form : form;

		for (let item in form) {
			form[item] = null;
		}

		that.setData(form);
	},
	/* 修改带参数跳转，简化使用方式 */
	goPage(e){
		const { currentTarget: {dataset: { ...args} }} = e;
		console.log(...args)
	}
};
