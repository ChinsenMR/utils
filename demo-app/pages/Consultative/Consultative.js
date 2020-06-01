// pages/Consultative/Consultative.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productId: 0, //商品ID
    page: 1, //当前页数
    row: 0, //数据长度
    allData: [],
    productlist:[],
    inputTxt:'',
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let productId = options.productId
    this.setData({
      productId: productId
    })
    wx.showLoading({
      title: '页面加载中',
    })
    this.getConsultationListWx()
  },

  //获取咨询内容
  consultInput: function (e) {
    console.log(e)
    this.setData({
      consultInput: e.detail.value
    })
  },

  /**
   * 提交咨询
   * */
  postConsult: function(e) {
    var _this = this
    this.setData({
      inputTxt: ''
    })
    if (this.data.consultInput == null || this.data.consultInput == "") {
      wx.showToast({
        title: '内容不能为空',
        showCancel: false, //不显示取消按钮
        confirmText: '确定',
        icon: 'none'
      })
    } else {
      wx.request({
        url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest?action=SetCommodityConsultation',
        data: {
          productId: this.data.productId,
          consultationText: this.data.consultInput,
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
              mask:true
            })
            setTimeout(function(){
              wx.navigateBack({
                delta:1
              })
            },1200)
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
    }
  },

  //获取咨询列表
  getConsultationListWx: function() {
    let _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetConsultationListWx',
        productId: _this.data.productId,
        pageIndex: _this.data.page,
        pageSize: 10
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res.data)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          _this.data.row = res.data.data.data2.length
          _this.data.allData = _this.data.allData.concat(res.data.data.data2)
          _this.setData({
            allData: _this.data.allData,
            productlist: res.data.data
          })
          console.log(_this.data.allData)
          // if (res.data.data.data2.length == 0) {
          //   wx.showToast({
          //     title: res.data.errorMsg,
          //     icon: 'none'
          //   })
          // }
        } else {
          _this.data.dataLength = 0
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      },
      fail: function(e) {
        _this.setData({
          isEmpty: true
        })
        wx.hideLoading()
      }
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
  onPullDownRefresh: function () {
    this.data.page = 1
    this.getConsultationListWx()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.row === 10) {
      this.data.page++
      this.getConsultationListWx()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})