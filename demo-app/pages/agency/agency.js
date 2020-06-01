Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadFinish: false,
    isAgency: false, // 是否是代理
    newsData: {},
    // userInfo: null,
    agentData: {},
    orderCount:0,
    agencyData: {} // 代理条件
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //this.getOrderCount();
    this.getAgentData(wx.getStorageSync('sessionId'))
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

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   return getApp().getShareData()
  // },



  getOrderCount: function () {
    let _this = this
    wx.$ajax({
      api: '/API/VshopProcess.ashx',
      data: {
        action: 'GetHisHopOrderCount',
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log(res)
      if (res.Status === 'success') {
       _this.setData({
         orderCount: res.data
       })
      } else {
       
      }
    }).catch(e => {
     
    })
  },

  // 前往信息公告
  goMyMessage: function(e) {
    var id = e.currentTarget.dataset.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/myMessage/myMessage?id=' + id,
    })
  },

  /**
   * 获取代理信息--http请求
   * */
  getAgentData: function(sessionId) {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetUserInfoBySessionId_Agent',
        SessionId: sessionId
      },
      success: function(res) {
        console.log(res.data)
        if (res.data.Status === "login" || res.data.errorMsg === "用户尚未登录") {
          getApp().turnToLoginPage('agency')
          return
        }
        if (res.data.Status === 'success') {
          wx.setNavigationBarTitle({
            title: '代理中心'
          })
          wx.setStorageSync('ReferralId', res.data.data.UserId)
          _this.setData({
            agentData: res.data.data,
            isAgency: true
          }, () => {
            _this.setData({
              loadFinish: true
            })
          })
        } else if (res.data.Status === 'nopower') {
          _this.GetDistributorCondition()
          wx.setNavigationBarTitle({
            title: '店主中心入口'
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false
          })
        }
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },
  
  //  获取成为代理的条件数据
  GetDistributorCondition: function() {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetDistributorCondition',
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        if (res.data.Status === 'success') {
          console.log(res.data)
          _this.setData({
            agencyData: res.data.data,
            isAgency: false
          }, () => {
            _this.setData({
              loadFinish: true
            })
          })
        }
        console.log('满足成为代理的条件--', res.data)
      },
      fail: function(e) {
        console.log('满足成为代理的条件err--', e)
      }
    })
  }
})