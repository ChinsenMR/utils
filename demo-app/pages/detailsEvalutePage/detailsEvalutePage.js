// pages/detailsEvalutePage/detailsEvalutePage.js
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
    page: 1,       // 当前页数
    dataLength: 0,  // 每次获取数据长度
    show: false, // 显示蒙层
    info: '' //评价内容
  },
  ProductId: 0,
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.ProductId = options.productId
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDataList(this.ProductId)
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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
  }
})