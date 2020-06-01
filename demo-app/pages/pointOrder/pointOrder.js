// pages/pointOrder/pointOrder.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // confirmList: {},
    pointOrder:{},
    couponsData: {}, // 优惠相关数据
    timeType: ['不限', '周一至周五', '周六、周日及公众假期'],
    payType: [],
    timeIndex: 0, // 送货时间，0不限，1周一至周五，2周六等假期
    payIndex: 0, // 付款方式后台返回
    integral: 0.00, // 积分
    isSelectIntegral: false, // 是否选择积分抵扣
    isUseBalance: false, // 是否使用余额,
    totalMoney: 0, // 支付总金额
    RealPaymentPoint: 0, //积分总额
    selectAddress: {}, // 地址
    remarkData: '', // 备注
    isMask: false,
    cur: 0, //如果有优惠券，那么初始化进来是选择第一个的
    conpouPrice: 0,
    isShow: true,
    selectIndex: 0,
    pointList: [], //积分信息
    // DifferenceValue: 0, //积分差额 
    MemberPoint: 0 //积分余额
  },

  toggle: function() {
    var that = this
    var show = !that.data.isShow
    that.setData({
      isShow: show
    })
  },
  /**
   * 拿到第一项的数据
   */
  defaultData: function(array) {
    console.log(array)
    if (!array.length) {
      return
    }
    var that = this
    var arr = array
    //显示第一个优惠券值
    that.setData({
      conpouPrice: arr[0].CouponValue,
    })
  },

  /**
   * 获取备注数据
   * */
  onGetRemark: function(e) {
    this.data.remarkData = e.detail.value
  },

  /**
   * 选择送货时间
   * */
  bindTimeChange: function(e) {
    this.setData({
      timeIndex: e.detail.value
    })
  },

  /**
   * 选择支付方式
   * */
  bindPayChange: function(e) {
    console.log(e)
    this.setData({
      payIndex: e.detail.value
    })
  },

  /**
   * 进入地址列表
   * */
  onToAddressPage: function(e) {
    wx.navigateTo({
      url: '/pages/shippingAddress/shippingAddress?type=1',
    })
  },


  // 获取地址列表
  getAddressList: function() {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetShippingAddressList',
        pageIndex: 1,
        pageSize: 10,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        console.log(res.data)
        if (res.data.Status == 'success') {
          if (!res.data.data.length) return
          _this.setData({
            selectAddress: res.data.data[0]
          })
        }
      }
    })
  },
  // 提交订单
  submit() {
    if (!this.data.selectAddress.ShippingId) {
      wx.showToast({
        title: '请填写地址',
        icon: 'none',
        duration: 2000
      })
      return
    } else if (this.data.RealPaymentPoint > this.data.pointList.MemberPoint) {
      wx.showToast({
        title: '积分余额不足',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let ShopCartInfo = []
    this.data.pointOrder.data.map((el) => {
      ShopCartInfo.push({
        skuId: el.SkuId,
        Amount: el.Price,
        Quantity: el.Quantity
      })
    })
    let _this = this
    console.log(this)
    this.setData({
      isMask: true
    })
    wx.showLoading({
      // title: '',
    })
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest?action=ConfirmOrder',
      data: {
        useMembersPoint: this.data.isSelectIntegral ? 1 : 0, // 是否积分抵扣
        useBalance: this.data.isUseBalance ? 1 : 0, // 是否余额抵扣
        PointNumber: this.data.couponsData.Point, // 使用积分数
        selectCouponValue: 0, // 优惠券金额
        Shippingcity: this.data.selectAddress.RegionId, // 用户所在城市编号
        shippingType: '', // 配送方式
        paymentType: this.data.couponsData.payType[this.data.payIndex].payId, // 支付方式
        couponCode: '', // 优惠券id
        redpagerid: '', // 红包id
        shippingId: this.data.selectAddress.ShippingId, // 地址ID，用户收货地址
        productSku: JSON.stringify({
          ShopCartInfo: ShopCartInfo
        }), // 订单商品规格
        buyAmount: this.data.pointOrder.totalPrice, // 订单金额
        from: '', // 团购数据
        shiptoDate: this.data.timeType[this.data.timeIndex], // 送货时间
        groupbuyId: '', // 团购id
        bargainDetialId: '', // 活动id
        limitedTimeDiscountId: '', // 限时优惠活动ID
        remark: this.data.remarkData, // 备注
        sessionId: wx.getStorageSync('sessionId'), // 用户id
        RealPaymentPoint: this.data.RealPaymentPoint || 0, //积分总额
        ProductId: this.data.pointList.ProductId, //商品ID
        ExchangeQuantity: this.data.pointList.ExchangeQuantity, //积分商品数量
        exChangeId: this.data.pointList.exChangeId //积分活动ID
        // DifferenceValue: this.data.DifferenceValue || 0 //金钱差额
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading()
        console.log('提交订单', res)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'fail') {
          _this.setData({
            isMask: false
          })
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
          return
        }
        if (res.data.Status === 'success') {
          wx.redirectTo({
            url: '/pages/finishOrder/finishOrder?orderId=' + res.data.OrderId 
            + '&money=' + _this.data.pointOrder.totalPrice 
            + '&exChangeId=' + _this.data.pointOrder.data[0].exChangeId
            + '&RealPaymentPoint=' + _this.data.RealPaymentPoint 
            + '&payType=' + '积分兑换' 
          })
        } else {
          _this.setData({
            isMask: false
          })
          wx.showToast({
            title: '提交失败:' + res.data.ErrorMsg,
            icon: 'none'
          })
        }
      },
      fail: function(e) {
        wx.hideLoading()
        _this.setData({
          isMask: false
        })
        console.log(e)
      }
    })
  },

  /**
   * 获取优惠、积分相关数据
   * */
  getConfirmOrderInfo: function(options) {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=GetConfirmOrderInfo',
      data: {
        sessionId: wx.getStorageSync('sessionId'),
        ShopCartInfo: JSON.stringify({
          ShopCartInfo: options
        })
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.Status === 'success') {
          console.log(res.data)
          // _this.defaultData(res.data.data.coupons)
          _this.setData({
            couponsData: res.data.data,
            payType: res.data.data.payType.map(el => {
              return el.payName
            })
          })
        }
      },
      fail: function(e) {
        console.log('优惠相关', e)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this
    if (options.selectAddress) {
      // console.log('地址', JSON.parse(options.selectAddress))
      this.setData({
        selectAddress: JSON.parse(options.selectAddress)
      })
    } else {
      this.getAddressList()
    }
    wx.getStorage({
      key: 'pointOrder',
      success: function(res) {
        console.log(JSON.parse(res.data))
        _this.setData({
          totalMoney: JSON.parse(res.data).totalPrice,
          pointOrder: JSON.parse(res.data)
        })
        let ShopCartInfo = []
        _this.data.pointOrder.data.map((el) => {
          ShopCartInfo.push({
            skuId: el.SkuId,
            Amount: el.Price,
            Quantity: el.Quantity,
            ProductId: el.ProductId
          })
        })
        _this.getConfirmOrderInfo(ShopCartInfo)
      }
    })
    var pointInfo = JSON.parse(wx.getStorageSync('pointOrder'))
    wx.request({
      url: getApp().data.url + '/API/VshopActivityProcess.ashx',
      data: {
        action: 'MemberPointAndProductInfo',
        productId: pointInfo.data[0].ProductId,
        Quantity: pointInfo.data[0].Quantity,
        exChangeId: pointInfo.data[0].exChangeId,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        _this.setData({
          pointList: res.data.data[0],
          RealPaymentPoint: res.data.data[0].RealPaymentPoint
          // DifferenceValue: res.data.data[0].DifferenceValue
        })
        console.log(res.data.data[0])
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.getConfirmOrderInfo()
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
  onPullDownRefresh: function() {},

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