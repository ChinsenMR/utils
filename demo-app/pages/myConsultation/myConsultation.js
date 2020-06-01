// pages/myConsultation/myConsultation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consultData: {},
    isMore: true,
    pageIndex: 1,
    hidden: false,
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getConsultList()
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetConsultationList',
        pageIndex: 1,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        that.data.consultData = res.data.data;
        that.setData({
          consultData: res.data.data
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
  onReachBottom: function () {
    if (this.data.isMore) {
      this.getMore()
    } else {
      this.setData({
        hidden: true
      })
    }
  },
  getMore: function () {
    var that = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetConsultationList',
        pageIndex: ++that.data.pageIndex,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        console.log(res)
        if (res.data.data.length == 0) {
          console.log('没有数据')
          that.data.isMore = false
        } else {
          var list = that.data.consultData;
          list.push.apply(list, res.data.data);
          // 设置数据  
          that.setData({
            consultData: list
          })
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  getConsultList: function () {
    var _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetConsultationList',
        pageIndex: 1,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      if (res.Status === 'success') {
        _this.consultData = res.data;
        console.log(_this.consultData)
        _this.setData({
          consultData: res.data,
          // isEmpty: _this.data.consultData.concat(res.data.data).length ? false : true
        })
      } else {
        _this.setData({
          isEmpty: _this.data.consultData.length ? false : true
        })
      }
    }).catch(e => {
      _this.setData({
        isEmpty: _this.data.consultData.length ? false : true
      })
    })
  },
})