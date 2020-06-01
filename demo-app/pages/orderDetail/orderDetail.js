// pages/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetailData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中'
    })
    this.getDataList(options.id)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getDataList: function (OrderId) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetOrderDetailByOrderId',
        OrderId: OrderId,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        if (res.data.Status === 'success') {
          _this.orderDetailData = res.data.data
          console.log(_this.orderDetailData)
          _this.setData({
             orderDetailData: res.data.data[0]
          })
        } else {

        }
      },
      fail: function (e) {
        wx.hideLoading()
      }
    })
  }
})