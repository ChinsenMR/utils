// pages/joinNest/joinNest.js
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: '', //页面参数
    richtextlist: [],
    allData:[],
    switchtype:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.parameter = options.parameter
    this.getData(options.parameter)
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
    return getApp().getShareData()
  },

  /**
 * 获取商品详情
 * */
  getData: function (parameter) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetShopDataByParm',
        parameter: parameter
      },
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log('页面数据', res.data)
        if (res.data.Status === 'fail') {
          wx.showModal({
            title: '提示',
            content: '该页面维护中...',
            showCancel: false,
            complete: function () {
              wx.navigateBack({
                
              })
            }
          })
          return
        }
        if (res.data.Status === 'success') {
          _this.setData({
            allData: res.data.LModules,
            switchtype: res.data.LModules.map(val => val.type),
          })
        }
        console.log(res.data.LModules)
        var richtextlist = []
        for (var v of res.data.LModules) {
          switch (v.type) {
            case 1:
              console.log("富文本");
              richtextlist.push(v)
              var richtext = richtextlist[0].content.fulltext
              WxParse.wxParse('richtext', 'html', richtext, _this, 5);
              break;
            case 2:
              console.log("文本标题");
              break;
            case 5:
              console.log("商品列表多功能");
              break;
            case 7:
              console.log("文本导航");
              break;
            case 10:
              console.log("分割线");
              break;
            case 11:
              console.log("辅助空白");
              break;
            case 12:
              console.log("顶部菜单");
              break;
            case 13:
              console.log("橱窗");
              break;
            case 14:
              console.log("视频");
              break;
            case 4:
              console.log("商品列表");
              break;
            case 6:
              console.log("搜索");
              break;
            case 8:
              console.log("图片导航");
              break;
            case 9:
              console.log("图片广告");
              break;
          }
        }
        
      },
      fail: function (e) {
        wx.hideLoading()
      }
    })
  }
})