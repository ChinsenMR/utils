Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    dataLength: 0,
    dataList: [],
    detailType: 1 // 类型 支出：1，收入：2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAmountList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {

  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.dataLength === 10) {
      this.data.page++
      this.getAmountList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

  /**
   *tab的点击处理函数,选择支出或收入 
   * */
  selected: function (e) {
    this.setData({
      page: 1,
      dataList: [],
      detailType: parseInt(e.target.dataset.type)
    })
    this.getAmountList()
  },

  /**
   * 获取收入或支出列表--http请求
   * */
  getAmountList: function () {
    let _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetAmountList',
        type: this.data.detailType,
        pageIndex: this.data.page,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log(res.data)
      _this.data.dataLength = res.data.length ? res.data.length : 0
      if (res.Status === 'success') {
        _this.data.dataLength = res.data.length
        _this.setData({
          dataList: _this.data.dataList.concat(res.data)
        })
      } else {
        _this.data.dataLength = 0
      }
    })
  }
})