

Page({
	data: {
		canvasWidth: 500,
		canvasWidth: 500,
		qrCodeData: {},
		roomId: 0,
		alertT: true
	},

	createQrcode() {
		wx.request({
			// 调用接口C
			url: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + res.data.access_token,
			method: 'POST',
			data: {
				"path": "pages/anchorList/anchorList",
				"width": 430
			},
			success(res) {
				debugger
				// res是二进制流，后台获取后，直接保存为图片，然后将图片返回给前台
			}
		})
	},

	getData() {


		let data = {
			action: 'GetAnchorLiveShareCodeImg',
			sessionId: wx.getStorageSync('sessionId'),
			roomId: this.data.roomId,

		}

		wx.$ajax({
			api: '/api/MiniProgramLive/api.ashx',
			data
		}).then(res => {

			this.setData({
				qrCodeData: { ...res.data.LiveAnchor, ...res.data.LiveDetail }
			})

			this.createCanT(700, 905);

		})

	},
	// 获取图片临时路径
	getImgPath(img) {
		return new Promise((resolve, reject) => {
			wx.getImageInfo({
				src: img,
				success(res) {
					resolve(res)
				},
				fail(e) {
					reject(e)
				}
			})
		})
	},
	createCanT(rpxw, rpxh) {
		let sysWidth = wx.getSystemInfoSync().windowWidth;
		let that = this;
		let rpx = sysWidth / 375;

		let { HeadImg, UserName, LiveTitle, ShareCardImgUrl, StartTime, CodeUrl } = that.data.qrCodeData;

		const ctx = wx.createCanvasContext('myCanvasT', that)

		ctx.setFillStyle('#fff')
		ctx.fillRect(0, 0, rpxw, rpxh)




		if (ShareCardImgUrl) {
			this.getImgPath(ShareCardImgUrl).then((res) => {
				ctx.drawImage(res.path, 12 * rpx, 70 * rpx, (650 / 2) * rpx, (369 / 2) * rpx);
				ctx.draw(true);

			})
		}


		ctx.setFontSize(15 * rpx)
		ctx.setFillStyle('rgb(74,74,74)')
		ctx.setTextAlign('center')
		ctx.fillText('长按二维码识别小程序', 137.5 * rpx, 475 * rpx)


		ctx.setTextAlign('left')
		// 名字
		ctx.fillText(UserName.length < 4 ? UserName : UserName.slice(0, 3) + '..', 60 * rpx, 28 * rpx);

		ctx.setFontSize(11 * rpx)

		ctx.fillText('长按二维码识别小程序', 137.5 * rpx, 475 * rpx)
		ctx.setFillStyle('rgb(161,143,121)')
		ctx.setTextAlign('left')
		// 描述
		ctx.fillText('给你分享一个直播', 60 * rpx, 44 * rpx)

		HeadImg ? this.getImgPath(HeadImg).then((res) => {
			ctx.save()
			ctx.beginPath()
			ctx.arc(32 * rpx, 30 * rpx, 18 * rpx, 0, 2 * Math.PI)
			ctx.clip()
			ctx.drawImage(res.path, 10 * rpx, 12 * rpx, 40 * rpx, 40 * rpx);
			ctx.restore()
			ctx.draw(true);
		}) : "";


		if (CodeUrl) {
			this.getImgPath(CodeUrl).then((res) => {
				ctx.drawImage(res.path, (53 / 2) * rpx, 300 * rpx, (130 / 2) * rpx, (130 / 2) * rpx);
				ctx.draw(true);

			})
		}

		ctx.setStrokeStyle('rgb(245,245,245)')
		ctx.strokeRect(15 * rpx, 280 * rpx, 320 * rpx, 101 * rpx)


		ctx.setTextAlign('left')
		ctx.setFontSize(14 * rpx)
		ctx.setFillStyle('rgb(74,74,74)')
		ctx.setTextAlign('left')
		ctx.fillText(`${LiveTitle}`, (198 / 2) * rpx, 324 * rpx);


		ctx.setTextAlign('left')
		ctx.setFontSize(14 * rpx)
		ctx.setFillStyle('rgb(74,74,74)')
		ctx.setTextAlign('left')
		ctx.fillText(`${StartTime}会直播哦！`, (198 / 2) * rpx, 350 * rpx);


		ctx.draw();
	},
	// 保存图片
	saveImg() {
		wx.showLoading({
			title: '正在保存',
			icon: 'none'
		})
		let _this = this

		wx.canvasToTempFilePath({
			canvasId: 'myCanvasT',
			success(res) {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success(data) {
						wx.showToast({
							title: '已保存到相册',
							icon: 'success',
							duration: 2000
						})
					},
					fail(err) {

						if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {

							this.getAuthorityAgain();
						} else if (err.errMsg != "saveImageToPhotosAlbum:fail cancel") {
							wx.showToast({
								title: '请截屏保存分享',
								icon: 'success',
								duration: 2000
							})
						}
					},
					complete(res) {
						var timer = setTimeout(() => {
							wx.hideLoading();
							clearTimeout(timer)
						}, 1500)
						console.log(res);
					}
				})
			},
			fail(e) {
				setTimeout(() => {
					_this.saveImg()
				}, 1500)

			}
		}, _this)









	},
	// 再次获取权限
	getAuthorityAgain() {
		let _this = this;
		wx.showModal({
			title: '保存海报',
			content: '需要你提供保存相册权限',
			success: function (res) {
				if (res.confirm) {
					wx.openSetting({
						success(setData) {
							if (setData.authSetting['scope.writePhotosAlbum']) {
								_this.saveImg()
							} else {
								wx.hideLoading();
								wx.showToast({
									title: '获取相册权限失败',
									icon: 'none'
								})
							}
						}
					})
				} else {
					wx.hideLoading();
					wx.showToast({
						title: '保存海报需要提供相册授权',
						icon: 'none'
					})
				}
			}
		});
	},
	closeAlert() {
		this.setData({
			alert: false,
			alertT: false,
		})
	},
	funFN(e) {
		if (e.currentTarget.dataset.index) {
			let that = this
			const query = wx.createSelectorQuery()
			query.select('#myCanvasT').boundingClientRect()
			query.exec(function (res) {
				that.createCanT(res[0].width, res[0].height)
			})

		} else {

		}
	},






	onShow() {
	},
	onLoad(opt) {
		this.setData({
      roomId: opt.RoomId
		})
		this.getData()
	}
})