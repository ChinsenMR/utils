// pages/detailList/detailList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailIndex: 0, // 顶部tabs选项
    dataList: [], // 数据列表
  },
  pageIndex: 1,
  dataLength: 10, // 每次获取的长度
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    if (options.type && options.type == 1) {
      this.loadExpectedData()
      this.setData({
        detailIndex: 0
      })
    } else if (options.type && options.type == 2) {
      this.loadCommissionData()
      this.setData({
        detailIndex: 1
      })
    } else {
      this.loadAccountData()
    }
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.dataLength == 10) {
      this.pageIndex++
        switch (parseInt(this.data.detailIndex)) {
          case 0:
            this.loadExpectedData()
            break;
          case 1:
            this.loadCommissionData()
            break;
          case 2:
            this.loadAccountData()
        }
    } else {
      console.log('没了')
    }
  },

  tabDetail: function(e) {
    var that = this
    console.log(e.currentTarget.dataset.index)
    if (that.data.detailIndex == e.currentTarget.dataset.index) {
      return false
    } else {
      that.setData({
        dataList: [],
        detailIndex: e.currentTarget.dataset.index
      })
    }
    this.pageIndex = 1
    switch (parseInt(that.data.detailIndex)) {
      case 0:
        this.loadExpectedData()
        break;
      case 1:
        this.loadCommissionData()
        break;
      case 2:
        this.loadAccountData()
    }
  },
  goDetails: function(e) {
    console.log('详情', e)
    wx.navigateTo({
      url: '/pages/commissionDetails/commissionDetails',
    })
  },

  // 获取预计佣金
  loadExpectedData: function() {
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetExpectedEarningList',
        sessionId: wx.getStorageSync('sessionId'),
        pageIndex: this.pageIndex,
        pageSize: 10
      }
    }).then(res => {
      console.log(res)
      if (res.Status == 'success') {
        this.dataLength = res.data.length
        var expectedEarningArr=[];
        if(this.dataLength>0){
          for (var item in res.data){
            res.data[item].OrderDate = res.data[item].OrderDate.replace('T',' ');
            res.data[item].OrderDate = res.data[item].OrderDate.substring(0, 16);
            expectedEarningArr.push(res.data[item])
          }
        }
        this.setData({
          dataList: this.data.dataList.concat(expectedEarningArr)
        })
      } else {
        this.dataLength = 0
      }
    }).catch(e => {
      this.dataLength = 0
    })
  },

  // 获取佣金明细列表
  loadCommissionData: function() {
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetCommissionDetails',
        sessionId: wx.getStorageSync('sessionId'),
        PageIndex: this.pageIndex,
        StartTime: '',
        CommType: '',
        PageSize: 10
      }
    }).then(res => {
      console.log(res)
      if (res.Status == 'success') {
        this.dataLength = res.data.length
        this.setData({
          dataList: this.data.dataList.concat(res.data)
        })
      } else {
        this.dataLength = 0
      }
    }).catch(e => {
      this.dataLength = 0
    })
  },

  // 获取佣金结算列表
  loadAccountData: function() {
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetBalanceDrawRequesList',
        sessionId: wx.getStorageSync('sessionId'),
        pageIndex: this.pageIndex,
        pageSize: 10
      }
    }).then(res => {
      console.log(res)
      if (res.Status == 'success') {
        this.dataLength = res.data.length
        this.setData({
          dataList: this.data.dataList.concat(res.data)
        })
      } else {
        this.dataLength = 0
      }
    }).catch(e => {
      this.dataLength = 0
    })
  },
})