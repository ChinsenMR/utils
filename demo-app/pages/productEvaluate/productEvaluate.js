// pages/productEvaluate/productEvaluate.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {}, //商品详情
    orderData: [], //评价列表
    ProductId: 0,
    page: 1,       // 当前页数
    dataLength: 0,  // 每次获取数据长度
    show: false, // 显示蒙层
    info: '' //评价内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      order: JSON.parse(wx.getStorageSync('refundOrder')),
      ProductId: JSON.parse(wx.getStorageSync('refundOrder')).OrderItems[0].ProductId
    })
    console.log(this.data.order)
    this.getDataList(this.data.ProductId)
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.dataLength == 10) {
      this.data.page++
      this.getDataList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorage({
      key: 'refundOrder',
      success: function (res) {
        console.log(res)
      }
    })
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
   * 获取评价列表
   * */
  getDataList: function (id) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetCommodityReviews_VshopProcess',
        productId: id,
        pageIndex: this.data.page,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.Status === 'success') {
          res.data.data.forEach(v => v.ReviewDate = v.ReviewDate.split('T').join(' '))
          _this.data.dataLength = res.data.data.length
          _this.data.orderData = res.data.data
          _this.setData({
            orderData: res.data.data
          })
          console.log(_this.data.orderData)
        } else {
          _this.data.dataLength = 0
          console.log('数据出错')
        }
      },
      fail: function (e) {
        _this.setData({
          isEmpty: true
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * 获取输入信息
   * */
  onGetInfo: function (e) {
    this.data.info = e.detail.value
    console.log(this.data.info)
  },

  /**
   * 点击提交处理函数
   */
  onSubmit: function (event) {
    this.RequestOrderReturn()
  },

  /**
   * 提交评价--http请求
   * */
  RequestOrderReturn: function () {
    wx.showLoading({
      title: ''
    })
    this.setData({
      show: true
    })
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=SubmitProductReview',
      data: {
        OrderId: this.data.order.OrderId,
        ReviewText: this.data.info || '默认好评',
        SkuId: this.data.order.OrderItems[0].SkuId,
        ProductId: this.data.order.OrderItems[0].ProductId,
        OrderItemId: this.data.order.OrderItems[0].OrderItemId,
        sessionId: wx.getStorageSync('sessionId')
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading()
        console.log(res)
        _this.setData({
          show: false
        })
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          wx.showToast({
            title: '提价评价成功',
            icon: 'none'
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/waitEvaluate/waitEvaluate'
            })
          }, 2000)
        } else {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
        }
      },
      fail: function (e) {
        wx.hideLoading()
        console.log(e)
        _this.setData({
          show: false
        })
      }
    })
  }
})