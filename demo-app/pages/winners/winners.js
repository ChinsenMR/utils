// pages/winners/winners.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:[],
    id: '',
    page: 1,
    dataLength: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id
    this.getDataList()
  },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
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
    if (this.data.dataLength === 10) {
      this.data.page++
      this.getDataList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },
  
  /**
   * 获取中奖列表
   * */ 
  getDataList: function () {
    let that = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=GetWinPriceUserList',
      data: {
        Gameid: this.data.id,
        pageIndex: this.data.page,
        pageSize: 10
      }
    }).then(res=>{
      if (res.Status !== 0) {
        that.setData({
          dataLength: 0
        })
      }
      for (let i = 0; i < res.Data.length; i++) {
        res.Data[i].PlayTime = res.Data[i].PlayTime.replace('T', ' ')
        res.Data[i].PlayTime = res.Data[i].PlayTime.substring(0, 16)
      }

      that.setData({
        dataList: that.data.dataList.concat(res.Data),
        dataLength: res.Data.length
      })
    }).catch(e=>{
      that.setData({
        dataLength: 0
      })
    })
  }
})