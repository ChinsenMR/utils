// pages/groupFinishOrder/groupFinishOrder.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0,
    orderId: '',
    payName: '',
    isMask: false,
    linkType:'', //拼团类型
    msg: '恭喜，订单提交成功！'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      money: options.money,
      orderId: options.orderId,
      payName: options.payType,
      linkType:options.linkType
    })
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
   * 立即支付
   * */
  onPayMent: function () {
    this.setData({
      isMask: true
    })
    wx.showLoading({
      // title: '',
    })
    let _this = this
    // 从服务器获取支付信息
    this.GetWxPayOrderByMiniPro(this.data.orderId).then(res => {
      console.log(res)
      // 调用微信支付
      this.WxPay(res).then(data => {
        wx.hideLoading()
        _this.setData({
          isMask: false,
          msg: '恭喜，订单支付成功！'
        })
        wx.navigateTo({
          url: '/pages/groupInformation/groupInformation?id=' + _this.data.orderId,
        })
        console.log('sucess-pay', data)
      }).catch(e => { // 支付出错
        wx.hideLoading()
        wx.showToast({
          title: '支付失败',
        })
        _this.setData({
          isMask: false,
          msg: '订单支付失败！'
        })
        console.log('fail-pay', e)
      })
    }).catch(e => { // 获取数据出错
      wx.hideLoading()
      wx.showToast({
        title: e.errorMsg || '出错了',
      })
      _this.setData({
        isMask: false
      })
    })
  },

  /**
   * 微信支付api
   * */
  WxPay: function (options) {
    console.log(options)
    return new Promise((resovle, reject) => {
      wx.requestPayment({
        'timeStamp': options.timestamp,
        'nonceStr': options.nonce_str,
        'package': options.package,
        'signType': options.signType,
        'paySign': options.paySign,
        'success': function (res) {
          resovle(res)
        },
        'fail': function (res) {
          reject(res)
        },
        'complete': function (res) {
          if (res.errMsg.indexOf('cancel') != -1) {
            reject(res)
          }
        }
      })
    })
  },

  /**
   * 获取支付信息接口--http
   * */
  GetWxPayOrderByMiniPro: function (order) {
    console.log(order)
    return new Promise((resolve, reject) => {
      wx.request({
        url: getApp().data.url + '/Api/VshopProcess.ashx',
        data: {
          action: 'GetWxPayOrderByMiniPro',
          out_trade_no: order,
          PayType: 1,
          sessionId: wx.getStorageSync('sessionId') // 用户id
        },
        success: function (res) {
          console.log(res)
          // 登陆
          if (res.data.Status === 'login') {
            turnToLoginPage()
          }
          resolve(res.data)
        },
        fail: function (e) {
          reject(e)
        }
      })
    })
  },

  gotoindex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})