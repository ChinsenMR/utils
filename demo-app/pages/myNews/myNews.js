// pages/myNews/myNews.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: 'read',
    checked: false,
    newsData: [],
    pageIndex: 1,
    dataType: 1, // 1消息、0公告
    isShowRead: 0, // 0显示，1不显示
    isMore: true,
    hidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
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
    this.getList()
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
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetNotic',
        pageIndex: 1,
        pageSize: 10,
        SendType: this.data.dataType,
        isDel: 0,
        isShowRead: 0,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        if (res.data.Status === "login") {
          getApp().turnToLoginPage()
          wx.hideNavigationBarLoading();
          // 停止下拉动作  
          wx.stopPullDownRefresh();
          return
        }
        that.newsData = res.data.data
        console.log(that.newsData)
        // that.onSelected(0)
        that.setData({
          newsData: res.data.data
        })
        // 隐藏导航栏加载框  
        wx.hideNavigationBarLoading();
        // 停止下拉动作  
        wx.stopPullDownRefresh();
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.isMore) {
      this.getMore()
    } else {
      this.setData({
        hidden: true
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function() {
  //   return getApp().getShareData()
  // },
  
  getMore: function() {
    var that = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetNotic',
        pageIndex: ++that.data.pageIndex,
        pageSize: 10,
        SendType: this.data.dataType,
        isDel: 0,
        isShowRead: this.data.isShowRead,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        console.log(res)
        if (res.data.data.length == 0) {
          console.log('没有数据')
          that.data.isMore = false
        } else {
          // 设置数据  
          that.setData({
            newsData: that.data.newsData.concat(res.data.data)
          })
        }
      },
      fail: function(e) {
        console.log(e);
      }
    })
  },

  // 选择消息或告示
  onSelected: function(e) {
    console.log(e) // 0 显示消息 1显示公告
    wx.showLoading({
      title: '加载中'
    })
    this.setData({
      newsData: []
    })
    if(e != 0){
      if (e.detail.code === 1) {
        this.data.dataType = 0
      } else if (e.detail.code === 0) {
        this.data.dataType = 1
      }
    }else{
      this.data.dataType = 0
      console.log(13)
    }
    this.data.pageIndex = 1
    this.getList()
  },

  /**
   * 显示未读
   * */
  checkboxChange: function(event) {
    console.log(event.detail.value)
    if (event.detail.value === true) {
      this.data.isShowRead = 1
    } else {
      this.data.isShowRead = 0
    }
    wx.showLoading({
      title: '加载中'
    })
    this.setData({
      newsData: []
    })
    this.data.pageIndex = 1
    this.getList()
  },

  // 显示列表
  getList: function() {
    var _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetNotic',
        pageIndex: this.data.pageIndex,
        pageSize: 10,
        SendType: this.data.dataType,
        isDel: 0,
        isShowRead: this.data.isShowRead,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        wx.hideLoading()
        // 登陆
        if (res.data.Status === "login") {
          getApp().turnToLoginPage()
          return
        }
        if (res.data.Status === 'success') {
          _this.newsData = res.data.data
          console.log(_this.newsData)
          _this.setData({
            newsData: res.data.data
          })
        } else if (res.data.Status === 'fail') {}
      },
      fail: function(e) {
        wx.hideLoading()
      }
    })
  }

})