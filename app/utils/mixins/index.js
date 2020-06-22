export default {
	/* 私有方法 */
	/* 获取当前页面 */
	_currentPage() {
		const pages = getCurrentPages();
		return pages[pages.length - 1];
	},

	/* 输入值 */
	inputValue(e) {
		const that = this._currentPage();
		const {
			currentTarget: {
				dataset: {
					name
				},
			},
			detail: {
				value
			},
		} = e;

		that.setData({
			[`form${name}`]: value
		});
	},

	/* 清除一个对象中所有的值 */
	clearValue(e) {
		const that = this._currentPage();

		const {
			currentTarget: {
				dataset: {
					form = e
				} /* 别觉得奇怪，e就是在生命周期调用，传入的值为对象 */ ,
			},
		} = e;

		form = e.currentTarget ? that.data.form : form;

		for (let item in form) {
			form[item] = null;
		}

		that.setData(form);
	},



	/* 修改小程序标题 */
	setTitle(title) {
		wx.setNavigationBarTitle({
			title
		});
	},


	/* 查看图片 */
	previewImage(current = '', urls = []) {
		/* 如果传入的是索引值 */
		if (typeof current == "number") {
			current = urls[current];
		}

		wx.previewImage({
			current,
			urls
		});
	},

	/* 修改带参数跳转，简化使用方式 */
	goPage(event) {
		const {
			currentTarget: {
				dataset: {
					options,
					url
				}
			},
			pageUrl,
			pageOptions
		} = event;

		wx.navigateTo({
			url: options ? url + this.concatOptions(options) : pageUrl + this.concatOptions(pageOptions)
		})
	},

	/* 将对象拼接成参数 */
	concatOptions(options = {}) {

		let keys = Object.keys(options).length > 0 ? '?' : '';
		
		for (let keyItem in options) {
			keys += `${keyItem}=${options[keyItem]}&`;
		}

		return keys = keys.substring(0, keys.length - 1);
	}

};