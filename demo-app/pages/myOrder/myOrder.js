import { turnToLoginPage } from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    select_all: false,
    isEmpty: false,
    orderList: [], // 订单列表
    page: 1, // 当前页数
    isMask: false,
    ShipOrderNumber: '',
    ExpressCompanyName: '',
    OrderItemsStatus: '', //订单售后状态
    dataLength: 0, // 每次获取数据长度
    isFullIphone:false,
    isLoading:false,//加载中
  },

  togroupPage:function(e){
    wx.navigateTo({
      url: '/pages/groupInformation/groupInformation?id=' + e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var isFullIphone = getApp().globalData.isFullIphone
    this.setData({
      status: options.status || 0,
      isFullIphone: isFullIphone
    })
  },

  // /**
  //  * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this
    this.setData({
      orderList: []
    })
    if (_this.data.orderList.length>0){
      _this.data.orderList = [];
      _this.setData({
        orderList: [],
      })
    }
    
    this.getDataList()
  },

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
    if (this.data.dataLength == 10) {
      this.data.page++
      this.getDataList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 取消订单
   * */
  cancelOrder: function (e) {
    let id = e.currentTarget.dataset.oid
    wx.showModal({
      title: '温馨提示',
      content: '是否取消当前订单',
      // success: (res) => {
      //   console.log('success',res)
      //   if (res.confirm) {
      //     console.log('cancel order', res)
      //     this.WxCancelOrder(e.currentTarget.dataset.oid)
      //   }
      // },
      complete: (res) => {
        // console.log('complete',res)
        if (res.confirm) {
          console.log('用户确定', res)
          this.WxCancelOrder(id)
        } else if (res.cancel) {
          console.log('用户取消')
        }
      }
    })
  },

  /**
   * 确认收货
   * */
  sureReceive: function (e) {
    wx.showModal({
      title: '温馨提示',
      content: '是否确认收货？',
      success: (res) => {
        if (res.confirm) {
          this.WxFinishOrder(e.currentTarget.dataset.order)
        }
      }
    })
  },

  /**
   * 进入详情页
   * */
  onTodDetailPage: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + e.currentTarget.dataset.id,
    })
  },

  /**
   * tabs切换显示不同状态的订单
   * */
  selected: function (e) {
    if (e.target.dataset.status == this.data.status) {
      return
    }
    this.data.page = 1
    this.setData({
      orderList: [],
      status: e.target.dataset.status
    })
    this.getDataList()
  },

  // 单项选择按钮
  select: function (e) {
    var that = this;
    let arr2 = [];
    var arr = that.data.orderList;
    var index = e.currentTarget.dataset.id;
    arr[index].checked = !arr[index].checked;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].checked) {
        arr2.push(arr[i])
      }
    };
    that.setData({
      orderList: arr
    })
    if (arr.length == arr2.length) {
      that.setData({
        select_all: true
      })
    } else {
      that.setData({
        select_all: false
      })
    }
  },

  // 全选
  select_all: function () {
    if (!this.data.orderList.map((el) => {
      if (el.OrderStatusNum == 1) return el
    }).length) {
      return
    }
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    if (that.data.select_all) {
      let arr = that.data.orderList;
      let arr2 = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].checked == true) {
          arr2.push(arr[i]);
        } else {
          arr[i].checked = true;
          arr2.push(arr[i]);
        }
      }
      that.setData({
        orderList: arr2
      })
    }
  },
  // 取消全选
  select_none: function () {
    let that = this;
    that.setData({
      select_all: !that.data.select_all
    })
    let arr = that.data.orderList;
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
      arr[i].checked = false;
      arr2.push(arr[i]);
    }
    that.setData({
      orderList: arr2
    })
  },

  //物流
  checklogistics: function (e) {
    console.log(e)
    let index = e.currentTarget.dataset.idx
    wx.navigateTo({
      url: '/pages/logisticsInform/logisticsInform?id=' + e.target.dataset.num +
        '&company=' + this.data.orderList[index].ExpressCompanyName +
        '&shipnum=' + this.data.orderList[index].ShipOrderNumber,
    })
  },

  /**
   * 获取选中订单
   * */
  getSelectedOrder() {
    var payArr = []
    for (var i = 0; i < this.data.orderList.length; i++) {
      if (this.data.orderList[i].checked && this.data.orderList[i].OrderStatusNum == 1) {
        payArr.push(this.data.orderList[i].OrderId)
      }
    }
    if (payArr.length == 0) {
      console.log('没有订单啊')
      wx.showModal({
        showCancel: false,
        content: '请先选择待支付订单',
        success: function (res) { }
      })
      return null
    } else {
      console.log('选中订单', payArr)
      return payArr
    }
  },

  /**
   * 批量取消订单
   * */
  cancelMany: function (e) {
    if (!this.getSelectedOrder()) {
      return
    }
    wx.showModal({
      title: '温馨提示',
      content: '是否取消当前订单',
      success: (res) => {
        if (res.confirm) {
          var cancelOrders = this.getSelectedOrder()
          console.log('可删除', cancelOrders)
          this.WxCancelOrder(cancelOrders)
        }
      }
    })

  },

  // 立即支付按钮
  onPayNow(e) {
    console.log(e)
    wx.showLoading({
      title: '',
      mask: true
    })
    let _this = this
    // 从服务器获取支付信息
    this.GetWxPayOrderByMiniPro(e.currentTarget.dataset.order).then(res => {
      if (res.Status == "fail") {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: res.errorMsg,
        })
        _this.setData({
          isMask: false,
          msg: res.errorMsg
        })
      } else {
      
      // 调用微信支付
      this.WxPay(res).then(data => {
        wx.hideLoading()
        console.log('sucess-pay', data)
        _this.data.page = 1
        _this.setData({
          orderList: []
        })
        _this.getDataList()
      }).catch(e => {   // 支付出错
        wx.hideLoading()
        console.log('fail-pay', e)
      })
      }
    }).catch(e => {     // 数据获取出
      wx.showModal({
        title: '提示',
        content: e.errorMsg || '出错了',
        showCancel: false
      })
      console.log('错误', e)
      wx.hideLoading()
    })
  },

  /**
   * 合并付款按钮点击事件处理函数
   * */
  onPay: function (e) {
    console.log('付款')
    if (!this.getSelectedOrder()) {
      return
    }
    console.log('可以付款啦')
    let _this = this
    this.showMask(true)
    // 从服务器获取支付信息
    this.GetWxPayOrderByMiniPro(this.getSelectedOrder().join(',')).then(res => {
      // 调用微信支付
      this.WxPay(res).then(data => {
        _this.showMask(false)
        console.log('sucess-pay', data)
        _this.data.page = 1
        _this.setData({
          orderList: []
        })
        _this.getDataList()
      }).catch(e => {   // 支付出错
        _this.showMask(false)
        console.log('fail-pay', e)
      })
    }).catch(e => {     // 数据获取出错
      this.showMask(false)
      wx.showToast({
        title: e.errorMsg || '出错了',
      })
      console.log('错误', e)
    })

  },
  /**
   * 蒙层
   * */
  showMask: function (data) {
    if (data) {
      this.setData({
        isMask: true
      })
      wx.showLoading({
        title: '',
      })
    } else {
      wx.hideLoading()
      this.setData({
        isMask: false
      })
    }
  },

  /**
   * 申请退款
   * */
  onApplyRefund: function (e) {
    console.log(e.currentTarget.dataset.index)
    let orderIndex = e.currentTarget.dataset.index.split('_')[0]
    let proIndex = e.currentTarget.dataset.index.split('_')[1]
    let order = {
      OrderId: this.data.orderList[orderIndex].OrderId,
      OrderTotal: this.data.orderList[orderIndex].OrderTotal,
      OrderStatusNum: this.data.orderList[orderIndex].OrderStatusNum,
      OrderItems: [this.data.orderList[orderIndex].OrderItems[proIndex]]
    }
    wx.setStorageSync("refundOrder", JSON.stringify(order))
    wx.navigateTo({
      url: '/pages/exchanged/exchanged',
    })
  },

  /**
   * 微信支付api
   * */
  WxPay: function (options) {
    console.log(options)
    return new Promise((resovle, reject) => {
      wx.requestPayment({
        'timeStamp': options.timestamp,
        'nonceStr': options.nonce_str,
        'package': options.package,
        'signType': options.signType,
        'paySign': options.paySign,
        'success': function (res) {
          resovle(res)
        },
        'fail': function (res) {
          reject(res)
        },
        'complete': function (res) {
          if (res.errMsg.indexOf('cancel') != -1) {
            reject(res)
          }
        }
      })
    })
  },

  /**
   * 确认收货接口http
   * */
  WxFinishOrder: function (ids) {
    let _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=WxFinishOrder',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        orderId: ids,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log('确认收货--', res)
      // var orderList = _this.data.orderList
      if (res.Status == "fail")
      {
        wx.showModal({
          content: res.errorMsg,
          showCancel: false
        })
      }
      _this.setData({
        orderList: []
      })
      _this.getDataList()
    })
  },
  /**
   * 取消订单接口--http
   * */
  WxCancelOrder: function (ids) {
    let _this = this
    console.log('取消的订单', ids)
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=WxCancelOrder',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        orderId: ids,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log('取消data-', res)
      if (res.Status === 'success') {
        _this.data.orderList = []
        _this.getDataList()
      } else {
        wx.showModal({
          content: '取消失败err:data err',
          showCancel: false
        })
      }
    })
  },

  /**
   * 获取支付信息接口--http
   * */
  GetWxPayOrderByMiniPro: function (order) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: getApp().data.url + '/Api/VshopProcess.ashx',
        data: {
          action: 'GetWxPayOrderByMiniPro',
          out_trade_no: order,
          PayType: 1,
          sessionId: wx.getStorageSync('sessionId') // 用户id
        },
        success: function (res) {
          // 登陆
          if (res.data.Status === 'login') {
            turnToLoginPage()
          }
          resolve(res.data)
        },
        fail: function (e) {
          reject(e)
        }
      })
    })
  },

  /**
   * 获取订单列表--http
   * */
  getDataList: function () { // isConcat是否上拉载的数据 true为上拉加载
    console.log(this.data.orderList,'222222');
    var _this = this
    if(_this.data.isLoading) return
    _this.data.isLoading=true
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetOrderListByUserId',
        pageIndex: this.data.page,
        pageSize: 10,
        status: this.data.status,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log(_this.data.page,'===================');
      _this.data.isLoading=false
      console.log(res)
      if (res.Status === 'success') {
        _this.data.dataLength = res.data.length
        _this.setData({
          orderList: _this.data.orderList.concat(res.data),
          isEmpty: _this.data.orderList.concat(res.data).length ? false : true
        })
      } else {
        console.log('数据出错')
        _this.data.dataLength = 0
        _this.setData({
          isEmpty: _this.data.orderList.length ? false : true
        })
      }
    }).catch(e => {
      _this.data.dataLength = 0
      _this.setData({
        isEmpty: _this.data.orderList.length ? false : true
      })
    })

  }

})