Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],          // 列表数据
    IntegralSourceType: 1, // 类型 明细0，收入1，支出2
    page: 1,               // 当前页
    dataLength: 0,         // 每次获取数据的长度
    isEmpty: false,
    SurplusIntegral: 0,   // 剩余积分
    SumIntegral: 0        // 总积分 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.dataLength === 10) {
      this.data.page++
      this.getData()
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
   * 选择积分列表类型
   * */
  onChangeTab: function (e) {
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      IntegralSourceType: parseInt(e.target.dataset.type),
      dataList: [],
      dataLength: 0,
      page: 1
    })
    this.getData()
  },

  /**
   * 获取数据--网络请求
   * @param: 
   *    action 方法
   *    IntegralSourceType 类型 明细0，收入1，支出2
   *    pageIndex 当前页
   *    pageSize 每页显示条数
   * */
  getData: function () {
    let _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetMyIntegralDetail',
        IntegralSourceType: this.data.IntegralSourceType,
        pageIndex: this.data.page,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log(res)
      if (res.Status === 'success') {
        if (res.data.Integraldetail && res.data.Integraldetail.length>0){
          for (var item in res.data.Integraldetail){
            res.data.Integraldetail[item]["TrateTime"] = res.data.Integraldetail[item]["TrateTime"].replace('T', ' ').substring(0,16);
          }
        }
        _this.setData({
          SurplusIntegral: res.data.SurplusIntegral,
          SumIntegral: res.data.SumIntegral,
          dataLength: res.data.Integraldetail.length,
          dataList: _this.data.dataList.concat(res.data.Integraldetail)
        })
      } else {
        _this.data.dataLength = 0
      }
      _this.setData({
        isEmpty: !_this.data.dataList.length ? true : false
      })
    }).catch(e => {
      _this.data.dataLength = 0
      console.log(e)
      _this.setData({
        isEmpty: !_this.data.dataList.length ? true : false
      })
    })
  }
})