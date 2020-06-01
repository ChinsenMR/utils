
var WxParse = require('../../wxParse/wxParse.js');
Page({
	data: {
		tabText: ['预告', '直播中', '回放'],
		TabCur: 0,
		scrollLeft: 0,
		LiveList: [],


		list: [],
		page: 0, // 分页
		rows: 4, // 每页条数
		isLastPage: false, // 是否为最后一页


	},
	// 获取列表数据
	// 去直播间
	toLive(e) {
		let { status, id } = e.currentTarget.dataset;
		if (status != 100 && status != 110) {
			return
		}
		let roomId = [id] // 房间号
		let customParams = { path: 'pages/index/index', pid: 1 }
		wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
		})
	},
	getList(currentPage, RoomId) {

		let { page, LiveList, isLastPage, rows, isLoading, TabCur } = this.data;


		if (currentPage) {
			page = 0;
			LiveList = [];
			isLastPage = false;
			this.setData({ page, LiveList, isLastPage })
		}

		if (isLastPage) { return } else { page++; this.setData({ isLoading: true }) }



		let data = {
			action: 'GetMpLiveList',
			sessionId: wx.getStorageSync('sessionId'),
			roomId: RoomId || -100,
			page,
			rows,
			liveStatus: TabCur == 0 ? '102' : TabCur == 1 ? '101' : '103'
		}

		wx.$ajax({
			api: '/api/MiniProgramLive/api.ashx',
			data
		}).then(res => {
			let { TotalCount } = res.data;

			let maxPage = Math.ceil(Number(TotalCount) / rows) || 1;

			if (page - 1 >= maxPage) { isLastPage = true; }

			LiveList = LiveList.concat(res.data.LiveList)
			// 最终结果
			isLoading = false;
			this.setData({ page, LiveList, isLastPage, isLoading })
			wx.stopPullDownRefresh()

		})

	},
	// getList(init) {
	// 	let { TabCur } = this.data;

	// 	if (init) { this.data.LiveList = [] }

	// 	wx.$ajax({
	// 		api: '/api/MiniProgramLive/api.ashx',
	// 		data: {
	// 			action: 'GetMpLiveList',
	// 			liveStatus: TabCur == 0 ? '102' : TabCur == 1 ? '101' : '103'
	// 		}
	// 	}).then(res => {
	// 		let { LiveList } = res.data;

	// 		this.setData({ LiveList })
	// 		console.log(LiveList)
	// 	})

	// },
	toUrl(e) {
		let { id, status } = e.currentTarget.dataset;
		if (status == 103) {

			wx.navigateTo({
				url: '/pages/liveVideo/liveVideo?id=' + id,
			});
		} else {
			try {
				let roomId = [id] // 房间号
				let customParams = { path: 'pages/index/index', pid: 1 }
				wx.navigateTo({
          url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
				})
			} catch (error) {
				console.warn(error)
			}

		}
	},

	trunVisitor(coun) {
		let _coun = 0;
		if (coun > 9999) {
			_coun = coun / 10000
		} else if (coun > 99999) {
			_coun = coun / 100000
		} else if (coun > 999999) {
			_coun = coun / 1000000
		} else if (coun > 999999) {
			_coun = coun / 1000000
		}

		return _coun.toFixed(2)
	},
	isCard(e) {
		this.setData({
			isCard: e.detail.value
		})
	},
	// 切换选择项
	tabSelect(e) {
		this.setData({
			TabCur: e.currentTarget.dataset.id,
			scrollLeft: (e.currentTarget.dataset.id - 1) * 60
		})
		this.getList(1);
	},




	// /* 默认获取数据方法 */
	// getList(currentPage) {

	// 	if (currentPage) {
	// 		this.data.page = currentPage;
	// 		this.data.list = [];
	// 		this.data.isLastPage = false;
	// 	}

	// 	if (this.data.isLastPage) {
	// 		return
	// 	}

	// 	this.data.page++;

	// 	let params = {};
	// 	// params.id = 394;
	// 	params.ta = {
	// 		pa: currentPage || this.data.page,
	// 		li: this.data.limit
	// 	}

	// 	app.ajax.getHeadlineList(params, res => {
	// 		// 拿到结果
	// 		let result = res.headlines;
	// 		// 计算最终条数
	// 		let maxPage = Math.ceil(Number(res.total) / Number(this.data.limit)) || 1;
	// 		// 判断是否是最后一页
	// 		if (this.data.page - 1 >= maxPage) {
	// 			this.data.isLastPage = true;
	// 		}
	// 		// 处理数据
	// 		result.forEach(item => {
	// 			// item.num = app.tools.tranCount(item.num)
	// 			this.data.list.push(item)
	// 		})
	// 		console.log(this.data.list)
	// 		// 最终结果
	// 		this.setData({
	// 			page: this.data.page,
	// 			list: this.data.list,
	// 			isLastPage: this.data.isLastPage
	// 		})
	// 		wx.stopPullDownRefresh()
	// 	})
	// },


	onPullDownRefresh() {
		this.getList(1);
		console.log('下拉刷新')
	},
	onReachBottom() {
		this.getList();
		console.log('上拉触底')
	},

	onShow() {
		// this.getDataList()
	},
	onLoad() {
		this.getList()
	}
})