Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    awardData: [],
    isEmpty: false
  },

  /**
   * 获取数据 
   * playDate等于today表示当天的奖品，playDate等于history表示历史奖品，
   * 不传则显示所有当前用户的奖品
   * */ 
   getData: function () {
     let _this = this
     wx.$ajax({
       api: '/Api/VshopProcess.ashx',
       data: {
         action: 'GetUserPriceResultList',
         sessionId: wx.getStorageSync('sessionId'),
         playDate: this.data.selected == 1 ? 'history' : 'today'
       }
     }).then(res=>{
       console.log(res)
       if (res.Status === 'success') {
         if (res.data.length) {
           for (let item of res.data) {
             item.awardName = _this.awardGrade(item.PrizeGrade)
             item.PlayTime = item.PlayTime.split('T')[0]
           }
         }
         _this.setData({
           awardData: res.data,
         })
       }
       _this.setData({
         isEmpty: _this.data.awardData.length ? false : true
       })
     })
    //  wx.request({
    //    url: getApp().data.url +'/Api/VshopProcess.ashx',
    //    data: {
    //     action: 'GetUserPriceResultList',
    //     sessionId: wx.getStorageSync('sessionId'),
    //     playDate: this.data.selected == 1?'history':'today'
    //    },
    //    success: function (res) {
    //     console.log(res)
    //      if (res.data.Status === 'success') {
    //        if (res.data.data.length) {
    //          for (let item of res.data.data) {
    //            item.awardName = _this.awardGrade(item.PrizeGrade)
    //            item.PlayTime = item.PlayTime.split('T')[0]
    //          }
    //        }
    //        _this.setData({
    //          awardData: res.data.data,
    //        })
    //      } else {
    //        wx.showModal({
    //          content: '网络错误err:' + res.data.errorMsg,
    //          showCancel: false
    //        })
    //      }
    //      _this.setData({
    //        isEmpty: _this.data.awardData.length?false:true
    //      })
    //    },
    //    fail: function (e) {
    //      _this.setData({
    //        isEmpty: _this.dataawardData.length ? false : true
    //      })
    //      wx.showModal({
    //        content: '网络错误err[timeout]',
    //        showCancel: false
    //      })
    //      console.log(e)
    //    }
    //  })
   },

  /**
   * 中奖等级
   * */ 
   awardGrade: function (data) {
     switch (data) {
       case 0:
        return '一等奖'
       case 1:
         return '二等奖'
       case 2:
         return '三等奖'
       case 3:
         return '四等奖'
     }
   },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
    
  // },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
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

  // },
  selected: function (e) {
    console.log(e)
    this.setData({
      awardData: [],
      selected: e.currentTarget.dataset.select
    })
    this.getData()
  }
})