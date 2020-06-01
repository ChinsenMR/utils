// pages/performance/performance.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stars: [0, 1, 2, 3, 4],
    key: -1, //评分
    CsId: 0, //客服ID
    nickName: '', //客服昵称
    avatarUrl: '' //客服头像
  },

  //打分
  onPitch: function(e) {
    var key = e.currentTarget.dataset.index
    this.setData({
      key: key
    })
  },
  //获取评价内容
  consultInput: function(e) {
    console.log(e)
    this.setData({
      consultInput: e.detail.value
    })
  },
  //提交
  Sumbit: function() {
    var _this = this
    if (_this.data.key == '-1') return
    this.setData({
      inputTxt: ''
    })
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx?action=AddServiceReview',
      data: {
        CsId: _this.data.CsId,
        Score: _this.data.key,
        ReviewText: _this.data.consultInput || '',
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin'
          })
        }
        if (res.data.Status === 'success') {
          wx.showToast({
            title: '提交成功',
            duration: 1200,
            mask: true
          })
          wx.setStorage({
            key: 'pingjia',
            data: 'true',
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1200)
        } else {
          wx.showToast({
            title: '提交失败',
            icon: 'none'
          })
        }
      },
      fail: function(err) {
        wx.hideLoading()
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      CsId: options.id,
      nickName: options.name,
      avatarUrl: options.url
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.setStorage({
      key: 'pingjia',
      data: 'false',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})