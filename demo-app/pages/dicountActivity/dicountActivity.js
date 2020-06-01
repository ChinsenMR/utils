// pages/dicountActivity/dicountActivity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEmpty: false,   // 是否为空
    productList: [],  // 商品列表
    dataLength: 10,   // 每次获取数据的长度
    page: 1,          // 当前页
    activityData: {}  // 活动信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.actId = options.id
    this.getProductList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
    })
    this.data.page = 1
    this.data.productList = []
    this.getActivityData()
    this.getProductList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.dataLength === 10) {
      this.data.page++
      this.getProductList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 获取满减商品列表--http请求
   * */
  getProductList: function () {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetLimitedTimeDiscountData',
        PageSize: 10,
        PageIndex: this.data.page,
        SortOrder: '',
        ProductName: ''
      },
      success: function (res) {
        console.log(res.data)
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (res.data.Status == 'success') {
          if (res.data.data) {
            _this.setData({
              activityData: res.data.activityData[0],
              productList: _this.data.productList.concat(res.data.data),
              dataLength: res.data.data.length
            })
          }
        } else {
          _this.setData({
            dataLength: 0
          })
        }
        _this.setData({
          isEmpty: _this.data.productList.length ? false : true
        })
      },
      fail: function (e) {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        _this.setData({
          dataLength: 0,
          isEmpty: _this.data.productList.length ? false : true
        })
        console.log(e)
      }
    })
  }
})