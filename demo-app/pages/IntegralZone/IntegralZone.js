// pages/IntegralZone/IntegralZone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEmpty: false,   // 是否为空
    dataList:[],
    banner:'',
    page: 1,
    pageSize: 10,
    id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id
    this.setData({
      id:options.id
    })
  },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {
  
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (option) {
    var that = this
    wx.$ajax({
      api: '/API/VshopActivityProcess.ashx?action=IntegralActivityProduct',
      data: {
        pageIndex: 1,
        pageSize: 10,
        id:that.data.id,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      that.setData({
        dataList: res.data,
        banner: res.ImgUrl
      })
      that.setData({
        isEmpty: that.data.dataList.length ? false : true
      })
    })
  },

  // /**
  //  * 生命周期函数--监听页面隐藏
  //  */
  // onHide: function () {
  
  // },

  // /**
  //  * 生命周期函数--监听页面卸载
  //  */
  // onUnload: function () {
  
  // },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {
  
  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {
  
  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {
  
  // }
})