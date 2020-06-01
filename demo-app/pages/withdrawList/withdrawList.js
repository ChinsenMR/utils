// pages/withdrawList/withdrawList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDetailData(options.id)
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

  /**
   * 获取详情信息--http请求
   * */ 
   getDetailData: function(id) {
     let _this = this
     wx.request({
       url: getApp().data.url +'/Api/VshopProcess.ashx',
       data: {
         action: 'GetBalanceWithdrawDetail',
         BalanceId: id,
         sessionId: wx.getStorageSync('sessionId')
       },
       success: function(res) {
         console.log(res.data)
         _this.setData({
           detailData: res.data.data
         })
       },
       fail: function(e) {
         console.log(e)
       }
     })
   }
})