// component/shopranking/shopranking.js
var QR = require("../../utils/qrcode.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabNum: 0,
    isEmpty: false,
    totalBalance: 1,
    maskHidden: false,
    rankType: 'shop',
    dataList: [],
    imagePath: '',
    // placeholder: 'http://wxapp-union.com', //默认二维码生成文本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDataList()
    // var size = this.setCanvasSize();//动态设置画布大小
    // var initUrl = this.data.placeholder;
    // this.createQrCode(initUrl, "mycanvas", size.w, size.h);
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

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 获取排名数据
   * */
  getDataList: function () {
    var _this = this
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetMyRanking',
        rankType: this.data.rankType,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      _this.data.maskHidden = true
      _this.setData({
        maskHidden: true
      })
      console.log(res)
      if (res.Status === 'success') {
        _this.data.dataList = _this.data.dataList.concat(res.data[0].MyTeamRankingList)
        if (!_this.data.dataList.length) {
          _this.setData({
            isEmpty: true
          })
        } else {
          _this.data.totalBalance = _this.data.dataList[0].Blance ? _this.data.dataList[0].Blance : 1
        }
        _this.setData({
          totalBalance: _this.data.totalBalance,
          dataList: _this.data.dataList,
          isEmpty: _this.data.dataList.length ? false : true
        })
      } else {
        _this.setData({
          isEmpty: _this.data.dataList.length ? false : true
        })
      }
    }).catch(e => {
      _this.setData({
        isEmpty: _this.data.dataList.length ? false : true
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

  // 选择排名类型
  onTabSelected: function (e) {
    var balance = 0
    this.data.dataList = []
    this.data.page = 1
    if (e.target.dataset.num == 0) {
      this.data.rankType = 'shop'
    } else {
      this.data.rankType = 'team'
    }
    this.getDataList()
    this.setData({
      tabNum: e.target.dataset.num
    })
  },

  //适配不同屏幕大小的canvas
  // setCanvasSize: function () {
  //   var size = {};
  //   try {
  //     var res = wx.getSystemInfoSync();
  //     var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
  //     var width = res.windowWidth / scale;
  //     var height = width;//canvas画布为正方形
  //     size.w = width;
  //     size.h = height;
  //   } catch (e) {
  //     // Do something when catch error
  //     console.log("获取设备信息失败" + e);
  //   }
  //   return size;
  // },
  // createQrCode: function (url, canvasId, cavW, cavH) {
  //   //调用插件中的draw方法，绘制二维码图片
  //   QR.api.draw(url, canvasId, cavW, cavH);
  //   setTimeout(() => { this.canvasToTempImage(); }, 1000);
  // },
  // //获取临时缓存照片路径，存入data中
  // canvasToTempImage: function () {
  //   var that = this;
  //   wx.canvasToTempFilePath({
  //     canvasId: 'mycanvas',
  //     success: function (res) {
  //       var tempFilePath = res.tempFilePath;
  //       console.log(tempFilePath);
  //       that.setData({
  //         imagePath: tempFilePath,
  //         // canvasHidden:true
  //       });
  //     },
  //     fail: function (res) {
  //       console.log(res);
  //     }
  //   }, this);
  // },
  // //点击图片进行预览，长按保存分享图片
  // previewImg: function (e) {
  //   var img = this.data.imagePath;
  //   console.log(img);
  //   wx.previewImage({
  //     current: img, // 当前显示图片的http链接
  //     urls: [img] // 需要预览的图片http链接列表
  //   })
  // }

})