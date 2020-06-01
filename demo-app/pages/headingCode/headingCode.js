// pages/headingCode/headingCode.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceList: [], //客服列表
    refresh: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  toGoCustomer: function() {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetAllHistory',
        typelist:'',
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin'
          })
          return
        } else {
          wx.navigateTo({
            url: '/pages/CustomerService/CustomerService',
          })
        }
      }
    })
  },

  //请求客服列表
  getCustomer: function() {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetAllCsManagerInfo',
        sessionId: wx.getStorageSync('sessionId') || ''
      },
      success: function(res) {
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          wx.hideLoading()
          console.log(res.data)
          _this.setData({
            serviceList: res.data.data
          })
        }
        if (res.data.Status === 'Enable') {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 2000)
        }
      },
      fail: function(e) {
        console.log(e)
        wx.showToast({
          title: '客服列表加载失败',
          icon: 'none',
          mask: true,
          duration: 1500
        })
        setTimeout(function() {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }, 1500)
      }
    })
  },

  //链接客服判断
  linkCustomer: function(e) {
    var amount = e.currentTarget.dataset.amount
    var _this = this;
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'CheckUserConsultAmount',
        CsId: e.currentTarget.dataset.index,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        console.log(res)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === "success") {
            wx.showModal({
              title: '提示',
              content: '是否连接该客服',
              success(res) {
                if (res.confirm) {
                  wx.showToast({
                    title: '正在连接中...',
                    icon: 'loading',
                    duration: 2000
                  })
                  setTimeout(function () {
                    wx.navigateTo({
                      url: '/pages/CustomerService/CustomerService?onCustomer=true&id=' + e.currentTarget.dataset.index,
                    })
                  }, 2000)
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })            
        }
        if (res.data.Status === "fail") {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            mask: true
          })
          setTimeout(function() {
            var serviceList = []
            _this.getCustomer()
          }, 2000)
        }
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },

  //刷新
  toRefresh: function() {
    var _this = this
    if (!_this.data.refresh) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      _this.setData({
        refresh: true
      })
      setTimeout(function() {
        _this.setData({
          refresh: false
        })
      }, 1000)
      _this.getCustomer()
    }
  },

  //返回首页
  backtoindex:function(){
    wx.switchTab({
      url: '/pages/index/index',
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
    wx.showLoading({
      title: '',
    })
    this.getCustomer()
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