// component/changeMoney/changeMoney.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0,  // 余额
    amount: null,  // 输入金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.balance)
    this.setData({
      money: options.balance
    })
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

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {
  
  // },

  writeMoney: function (e) {
    this.data.amount = e.detail.value
  },

  onSumbit: function  () {
    if (this.data.money == 0 || this.data.amount > this.data.money) {
      wx.showModal({
        title: '提示',
        content: '佣金金额不足，无法转到余额！',
        showCancel: false
      })
      return
    }
    // if (this.data.amount>this.data.money) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '输入的金额不能大于可转金额',
    //     showCancel: false
    //   })
    //   return
    // }
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest?action=CommissionToAmount',
      data: {
        Amount: this.data.amount,
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res=>{
      console.log(res)
      if (res.Status === 'success') {
        wx.showToast({
          title: '操作成功',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        setTimeout(function () {
          wx.navigateBack({
          })
        }, 1600)
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorMsg,
          showCancel: false
        })
      }
    })
  }
  // 
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   return getApp().getShareData()
  // }
})