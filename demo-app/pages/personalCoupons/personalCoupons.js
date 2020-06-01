// pages/personalCoupons/personalCoupons.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    isEmpty: false,
    bgColor: '#FF6578'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetCouponsList()
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
   * 获取优惠券列表
   * */
  GetCouponsList: function () {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this
    let id = wx.getStorageSync('sessionId')
    wx.request({
      url: getApp().data.url + '/Api/VshopActivityProcess.ashx',
      data: {
        action: 'GetAllCouponList',
        sessionId: id
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.Status === 'success') {
          console.log(res)
          _this.setData({
            dataList: res.data.data
          })
        }
        _this.setData({
          isEmpty: _this.data.dataList.length ? false : true
        })
        //  console.log(_this.data.dataList)
      },
      fail: function (e) {
        wx.hideLoading()
        _this.setData({
          isEmpty: _this.data.dataList.length ? false : true
        })
      }
    })
  },
  getCoupon: function (e) {
    console.log(e)
    if (e.currentTarget.dataset.text=='已领完'){
          return;
    }
    this.getCouponData(e.currentTarget.dataset.couponid)
  },
  getCouponData: function (couponId) {
    let _this = this
    let id = wx.getStorageSync('sessionId')
    // console.log(id)
    wx.request({
      url: getApp().data.url + '/Api/VshopActivityProcess.ashx',
      data: {
        action: 'ReceiveCoupon',
        couponId: couponId,
        sessionId: id
      },
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        if (res.data.Status === 'success') {
          console.log('123')
          wx.showToast({
            title: '领取成功',
          })
      }else{
          console.log(res.data.errorMsg)
        //此处为领取不成功的所有抛错
          wx.showModal({
            title: '提示',
            content:res.data.errorMsg,
            showCancel:false,
            success: function (res) {
              if (res.confirm) {
                _this.GetCouponsList()  
              }
            }
          })
          return;
      }
      },
      fail: function (e) {
        wx.hideLoading()
        console.log(e)
        _this.setData({
          isEmpty: _this.data.dataList.length ? false : true
        })
        console.log(e)
      },
    })
  }
})