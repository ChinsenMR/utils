// pages/confirmOrder/confirmOrder.js
import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    confirmList: {},
    couponsData: {}, // 优惠相关数据
    otherData: {},
    timeType: ['不限', '周一至周五', '周六、周日及公众假期'],
    payType: [],
    ShippingTemplate: [],
    PointToCashRate: '', //积分比例
    timeIndex: 0, // 送货时间，0不限，1周一至周五，2周六等假期
    payIndex: 0, // 付款方式后台返回
    Shippingindex: 0, //配送方式由后台返回
    isSelectIntegral: false, // 是否选择积分抵扣
    isUseBalance: false, // 是否使用余额,
    totalMoney: 0.00, // 支付总金额
    selectAddress: {}, // 地址
    remarkData: '', // 备注
    isMask: false,
    conpouPrice: 0, //优惠券金额
    idcoupon: [], //优惠券ids
    isShow: -1,
    selectIndex: -1, // 选择的优惠券索引
    couponID: '',
    deductMoney: 0, //可抵用金额
    AmountMoney: 0, //可用支付余额
    Point: 0, //可抵用积分
    PonitToCashMaxAmount: 0, //积分兑换金额最大值	
    falseamount: false, //根据金额判断余额是否显示
    falsePoint: false, //根据金额判断积分是否显示
    CountFeright: 0.00, //运费
    totalFreight: 9999, //总金额加运费
    shippingtemlatelist: [],
    activityAttendTime:true,
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
  },

  // 选择优惠劵
  onSelectCoupon(e) {
    console.log('选中优惠劵', e.detail)
    // 检查其他订单是否使用了优惠卷
    for (let i = 0; i < this.data.shippingtemlatelist.length; i++) {
      if (i != e.detail.parentIndex) {
        for (let j = 0; j < this.data.shippingtemlatelist[i].coupons.length; j++) {
          if (this.data.shippingtemlatelist[i].coupons[j].Id == e.detail.idcoupon && this.data.shippingtemlatelist[i].coupons[j].isSelected) {
            wx.showToast({
              icon: 'none',
              title: '优惠卷已使用',
            })
            return
          }
        }
      }
    }

    let couponTotalValue = 0;
    let couponType = 1;
    // 选中复位
    for (let val of this.data.shippingtemlatelist[e.detail.parentIndex].coupons) {
      if (val.Id === e.detail.idcoupon) {
        // 选中当前项
        val.isSelected = !val.isSelected
      } else {
        val.isSelected = false
      }
    }

    // 计算优惠金额
    let idcoupon = this.data.shippingtemlatelist.map((val) => {
      for (let i = 0; i < val.coupons.length; i++) {
        if (val.coupons[i].isSelected) {
          couponType = val.coupons[i].CouponReductionType;
          couponTotalValue += val.coupons[i].CouponValue
          return val.coupons[i].Id
        }
      }
      return 0
    })
    this.setData({
      idcoupon: idcoupon,
      conpouPrice: couponTotalValue,
      shippingtemlatelist: this.data.shippingtemlatelist
    })

    console.log('优惠卷总ids', idcoupon)
    console.log('优惠卷总金额', couponTotalValue)
    this.couponChange(couponTotalValue, couponType)
  },

  //选择优惠券金额改变
  couponChange: function (couponValue, couponType) {
    var that = this
    var isSelectIntegral = this.data.isSelectIntegral
    var isUseBalance = this.data.isUseBalance
    var totalPrice = parseFloat(couponType == 2 ? (this.data.confirmList.totalPrice * couponValue / 10) : (this.data.confirmList.totalPrice - couponValue)).toFixed(2)
    var CountFeright = parseFloat(this.data.CountFeright)
    var totalMoney = parseFloat(totalPrice).toFixed(2)
    var totalFreight = (parseFloat(CountFeright) + parseFloat(totalPrice)).toFixed(2)
     wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetPointAndBanlanceInfo',
        sessionId: wx.getStorageSync('sessionId'),
        useBalance: 0,
        usePoint: 0,
        amount: totalMoney,
        freight: CountFeright
      },
      success: function (res) {
        if (res.data.Status == 'success') {
          that.setData({
            deductMoney: res.data.data.canUsePointToCash,
            Point: res.data.data.canUsePoint
          })
        } 
      }
    })
    that.setData({
      totalMoney: totalPrice,
      isSelectIntegral: false,
      isUseBalance: false,
      totalFreight: totalFreight
    })
    console.log(totalFreight)
    //更改优惠券减免金额
    that.setData({
      conpouPrice: couponValue ? couponValue : 0,
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
   * 选择配送方式
   * */
  bindChange_select: function(e) {
    const curindex =e.detail.e; // ev.target.dataset.current
    this.data.shippingtemlatelist[0].Shippingindex = parseInt(curindex)
    this.setData({
      shippingtemlatelist: this.data.shippingtemlatelist
    })
    this.countfreighttype()
  },

  /**
   * 进入地址列表
   * */
  onToAddressPage: function(e) {
    wx.navigateTo({
      url: '/pages/shippingAddress/shippingAddress?type=1',
    })
  },

  /**
   * 是否使用积分
   * */
  onSwitchChange: function(e) {
    var _this = this
    console.log(e)
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetPointAndBanlanceInfo',
        sessionId: wx.getStorageSync('sessionId'),
        useBalance: this.data.isUseBalance?1:0, 
        usePoint: e.detail.value?1:0, 
        amount: parseFloat(_this.data.totalMoney).toFixed(2), 
        freight: parseFloat(this.data.CountFeright)
      },
      success: function (res) {
        if (res.data.Status == 'success') {
          if (e.detail.value){
            var isSelectIntegral = true
          }else{
            var isSelectIntegral = false
          }
          let totalFreight = res.data.data.payMoney
          var falseamount = _this.data.falseamount 
          var falsePoint = _this.data.falsePoint         
          if (totalFreight === 0 && _this.data.isUseBalance != true){
            falseamount = true
          }else{
            falseamount = false
          }
          if (totalFreight === 0 && e.detail.value === false){
            falsePoint = true
          }else{
            falsePoint = false
          }
          _this.setData({
            isSelectIntegral: isSelectIntegral,
            totalFreight: res.data.data.payMoney,
            falseamount: falseamount,
            falsePoint: falsePoint
          })    
        }
        console.log(_this.data.falseamount)
      }
    })
  },

  /**
   * 是否使用余额
   * */
  onSwitchBalanceChange: function(e) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetPointAndBanlanceInfo',
        sessionId: wx.getStorageSync('sessionId'),
        useBalance: e.detail.value ? 1 : 0,
        usePoint: _this.data.isSelectIntegral ? 1 : 0,
        amount: parseFloat(_this.data.totalMoney).toFixed(2),
        freight: parseFloat(this.data.CountFeright)
      },
      success: function (res) {
        if (res.data.Status == 'success') {
          let totalFreight = res.data.data.payMoney
          var falsePoint = _this.data.falsePoint
          var falseamount = _this.data.falseamount
          if (e.detail.value) {
            var isUseBalance = true
          }else{
            var isUseBalance = false
          }
          if (totalFreight === 0 && !_this.data.isSelectIntegral) {
            falsePoint = true
          }else{
            falsePoint = false
          }
          if (totalFreight === 0 && e.detail.value === false) {
            falseamount = true
          } else {
            falseamount = false
          }
          _this.setData({
            isUseBalance: isUseBalance,
            totalFreight: res.data.data.payMoney,
            falsePoint: falsePoint,
            falseamount: falseamount
          })
        }
        console.log(_this.data.falsePoint)
      }
    })
  },


// 校验是否还有减免次数
checkActivityAttendTime: function(productId,cb) {
  var _this = this
  return new Promise(resolve => {
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'CheckActivityAttendTime',
        productId:productId,
        sessionId: wx.getStorageSync('sessionId')
      },
      async:false,
      success: function(res) {
        resolve(res)
   
        
      }
    })
  })
},


  // 获取地址列表
  getAddressList: function() {
    var _this = this
    return new Promise(resolve => {
      wx.request({
        url: getApp().data.url + '/Api/VshopProcess.ashx',
        data: {
          action: 'GetShippingAddressList',
          pageIndex: 1,
          pageSize: 10,
          sessionId: wx.getStorageSync('sessionId')
        },
        success: function(res) {
          resolve(res)
          // 登陆
          if (res.data.Status === 'login') {
            turnToLoginPage()
            return
          }
          if (res.data.Status == 'success') {
            if (!res.data.data.length) return
            _this.setData({
              selectAddress: res.data.data[0]
            })
            console.log('获取addr:', res.data.data)
          }
        }
      })
    })
  },

  // 计算运费
  countfreighttype: function() {
    let _this = this
    let shippingList = []
    this.data.shippingtemlatelist.map((el) => {
      el.product.forEach(v => {
        shippingList.push({
          ModeId: parseInt(el.Mode[el.Shippingindex].ModeId),
          Quantity: parseInt(v.Quantity),
          SkuId: String(v.SkuId)
        })
      })
    })
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'CalculationFreight',
        productSku: JSON.stringify({
          ShopCartInfo: shippingList
        }), // 订单商品规格
        RegionId: _this.data.selectAddress.RegionId || 0, //区域IDx
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        if (res.data.Status == 'success') {
          _this.setData({
            CountFeright: res.data.CountFeright
          })
        }
        _this.getTotalFreight()
      }
    })
  },

  // 运费与总额
  getTotalFreight: function() {
    let _this = this
    var CountFeright = parseFloat(this.data.CountFeright)
    var totalMoney = parseFloat(this.data.totalMoney)
    var totalFreight = (totalMoney + CountFeright).toFixed(2)
    console.log(totalFreight)
    _this.setData({
      totalFreight: totalFreight
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
    }
    let ShopCartInfo = []
    this.data.shippingtemlatelist.map((el) => {
      el.product.forEach(v => {
        ShopCartInfo.push({
          ModeId: parseInt(el.Mode[el.Shippingindex].ModeId),
          Quantity: parseInt(v.Quantity),
          Amount: String(v.Amount),
          SkuId: String(v.SkuId),
          ProductId: parseInt(v.ProductId),
          TemplateId: parseInt(el.TemplateId),
          LimitedTimeDiscountId: String(v.LimitedTimeDiscountId)
        })
      })
    })
    let _this = this
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
        PointNumber: this.data.otherData.Point, // 使用积分数
        selectCouponValue: this.data.idcoupon, // 优惠券
        Shippingcity: this.data.selectAddress.RegionId, // 用户所在城市编号
        shippingType: '', // 配送方式
        paymentType: this.data.otherData.payType[this.data.payIndex].payId, // 支付方式
        couponCode: '', // 优惠券id
        redpagerid: '', // 红包id
        TemplateId: this.data.confirmList.data[0].TemplateId, //模板id
        shippingId: this.data.selectAddress.ShippingId, // 地址ID，用户收货地址
        productSku: JSON.stringify({
          ShopCartInfo: ShopCartInfo
        }), // 订单商品规格
        buyAmount: (this.data.confirmList.totalPrice * 1 + this.data.CountFeright * 1), // 订单金额
        from: '', // 团购数据
        shiptoDate: this.data.timeType[this.data.timeIndex], // 送货时间
        groupbuyId: '', // 团购id
        bargainDetialId: '', // 活动id
        limitedTimeDiscountId: '', // 限时优惠活动ID
        remark: this.data.remarkData, // 备注
        sessionId: wx.getStorageSync('sessionId') // 用户id
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading()
        console.log('提交订单', res)
        if (res.data.Status === 'success') {
          wx.redirectTo({
            url: '/pages/finishOrder/finishOrder?orderId=' + res.data.OrderId +
              '&money=' + this.data.totalFreight +
              '&payType=' + _this.data.otherData.payType[_this.data.payIndex].payName
          })
        } else {
          if (res.data.Status === 'fail') {
            _this.setData({
              isMask: false
            })
            wx.showToast({
              title: res.data.errorMsg,
              icon: 'none'
            })
            setTimeout(function() {
              // wx.switchTab({
              //   url: '/pages/index/index'
              // })
              wx.navigateBack({
                delta: 1
              })
            }, 2000)
          } else {
            _this.setData({
              isMask: false
            })
            wx.showToast({
              title: '提交失败!' + res.data.errorMsg,
              icon: 'none'
            })
          }
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
    console.log(options)
    let _this = this
    return new Promise(resolve => {
      wx.request({
        url: getApp().data.url + '/Api/VshopProcess.ashx?action=GetConfirmOrderInfo',
        data: {
          sessionId: wx.getStorageSync('sessionId'),
          ShopCartInfo: JSON.stringify({
            ShopCartInfo: options
          }),
          RegionId: _this.data.selectAddress.RegionId || 0
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          debugger
          resolve(res)
          // 登陆
          if (res.data.Status === 'login') {
            turnToLoginPage()
          }
          if (res.data.Status === 'success') {
            console.log(res)
            res.data.data.ShippingTemplate.forEach(v => {
              v.Shippingindex = 0
            })
            _this.setData({
              otherData: res.data.data,
              deductMoney: res.data.data.deductMoney, //可抵用金额
              Point: res.data.data.Point, //可抵用积分
              PointToCashRate: res.data.data.PointToCashRate, // 积分换算比例
              PonitToCashMaxAmount: res.data.data.PonitToCashMaxAmount, // 积分抵用最大值
              payType: res.data.data.payType.map(el => {
                return el.payName
              }),
              shippingtemlatelist: res.data.data.ShippingTemplate
            })
            let idcoupon = _this.data.shippingtemlatelist.map((val) => {
              return 0
            })
            _this.countfreighttype()
            _this.defaultData(res.data.data.ShippingTemplate[0].coupons)
            _this.setData({
              idcoupon: idcoupon
            })
          } else {
            if (res.data.Status === 'fail') {
              _this.setData({
                isMask: false
              })
              wx.showToast({
                title: res.data.errorMsg,
                icon: 'none'
              })
              setTimeout(function() {
                wx.navigateBack({
                  delta: 1
                })
              }, 2000)
            } else {
              _this.setData({
                isMask: false
              })
              wx.showToast({
                title: '生成订单失败',
                icon: 'none'
              })
            }
          }
        },
        fail: function(e) {
          console.log('优惠相关', e)
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  getData: function() {
    let _this = this
    let data = JSON.parse(wx.getStorageSync("confirmOrder"))
    
    console.log(data)
    _this.setData({
      totalMoney: data.totalPrice,
      totalFreight: data.totalPrice,
      confirmList: data
    })
    let ShopCartInfo = []
    _this.data.confirmList.data.map((el) => {
      _this.checkActivityAttendTime(el.ProductId).then(res=>{
             // 登陆
             if (res.data.Status === 'login') {
              turnToLoginPage()
             
            }
            if (res.data.Status == 'success') {
              _this.setData({
                totalMoney:res.data.data!='False'?_this.data.totalMoney:parseFloat(_this.data.totalMoney)+parseFloat(_this.data.confirmList.discountMoney),
                activityAttendTime: res.data.data
              })
            }
       
      })
      ShopCartInfo.push({
        valueStr: el.valueStr,
        skuId: el.SkuId,
        Amount: el.Price,
        Quantity: el.Quantity,
        ProductId: el.ProductId,
        LimitedTimeDiscountId:  Array.isArray(el.LimitedTimeDiscountInfo) ? (el.LimitedTimeDiscountInfo.length ? el.LimitedTimeDiscountInfo[0].LimitedTimeDiscountId : 0) : el.LimitedTimeDiscountInfo
      })
    })
    return ShopCartInfo
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function() {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var _this = this
    this.setData({
      selectAddress: {}
    })
    if (wx.getStorageSync('address')) {
      console.log('地址', JSON.parse(wx.getStorageSync('address')))
      this.setData({
        selectAddress: JSON.parse(wx.getStorageSync('address'))
      })
      this.getConfirmOrderInfo(this.getData())
    } else {
      this.getAddressList().then(res => {
        console.log('addr---', res)
        this.getConfirmOrderInfo(this.getData())
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.removeStorageSync('address')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    wx.removeStorageSync('address')
  },

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function() {},

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function() {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function() {

  // }
})