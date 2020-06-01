// pages/newPage/detail.js
import {
  warrant,
  bindReferralId,
  turnToLoginPage
} from '../../utils/login.js';
import { throttle, countDown } from '../../utils/util.js';
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: {
      hour: 0,
      minute: 0,
      second: 0
    }, // 倒计时

    proDetail: {}, // 商品详情数据
    salePrice: 0, // 销售价格
    count: 1, // 商品数量
    exChangeId: 0, // 活动ID 0是不参与活动商品
    evaluationCount: 0, // 评价数量
    evaluationList: [], // 评价列表
    
    skuSelectedInfo: null, // 选中的sku info
    skuIds: [], // 选中的sku值
    skuData: {}, // 获取的sku数据

    showSelectDialog: false, // 显示sku选择框
    isFocus: false,     // 是否关注
    // tabCurrentItem: 0,  // 顶部tabs
    integralList: null, //积分详情
    swiperH: 150,       // 轮播组件swiper高度
  },
  proId: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('路由传参',options)
    if (options.id) {
      this.proId = options.id
    }
    
    if (options.exChangeId) { // 积分
      this.setData({
        exChangeId: options.exChangeId
      })
      this.getIntegral(this.proId)
    }
    
    if (options.ReferralId) {
      wx.setStorageSync('ReferralId', options.ReferralId)
      bindReferralId(options.ReferralId)
    }

    if (options.scene) {
      let scene = decodeURIComponent(options.scene).split('&')
      console.log('二维码分享：', scene)
      this.proId = scene[0]
      wx.setStorageSync('ReferralId', scene[1])
      bindReferralId(scene[1])
    }

    this.getData(this.proId)
  },

  // 页面相关事件处理函数--页面显示
  onShow: function () {
    this.loadEvaluation(this.proId)
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

  // 监听滚动事件
  onPageScroll: function (data) {
    throttle(() => {
      if (data.scrollTop > 350) {
        if (this.data.showToTop) return
        this.setData({
          showToTop: true
        })
      } else {
        if (!this.data.showToTop) return
        this.setData({
          showToTop: false
        })
      }
    }, 300, 100)()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let path;
    if (wx.getStorageSync("ReferralId")) {
      path = "/pages/productDetail/productDetail?id=" + this.proId + "&ReferralId=" + wx.getStorageSync("ReferralId")
    } else {
      path = "/pages/productDetail/productDetail?id=" + this.proId
    }
    console.log(path)
    return {
      title: this.data.proDetail.productinfo[0].ProductName,
      path: path
    }
  },

  // 弹窗外层禁止滑动
  stop: function () {},

  // 选择头部tabs
  onSelectTabs: function (e) {
    this.setData({
      tabCurrentItem: parseInt(e.currentTarget.dataset.item)
    })
  },

  /**
   * 图片加载完成事件,动态设置swiper高度
   * */
  onLoadImg: function (e) {
    if (this.data.swiperH !== 150) {
      return
    }
    console.log('设置swiper高度', e)
    var winWid = wx.getSystemInfoSync().windowWidth
    this.data.swiperH = winWid * e.detail.height / e.detail.width
    this.setData({
      swiperH: this.data.swiperH
    })
  },

  /**
  * 预览图片
  * */
  previewImage: function (e) {
    wx.previewImage({
      urls: this.data.proDetail.Img,
    })
  },

  // 关闭弹窗
  onCloseDialog: function () {
    this.setData({
      showSelectDialog: false
    })
  },

  // 收藏商品--关注点击事件
  onFocus: function () {
    this.data.isFocus = !this.data.isFocus
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=AddToFavorite',
      data: {
        ProductId: this.proId,
        IsFavorite: this.data.isFocus ? 1 : 0,
        sessionId: wx.getStorageSync('sessionId') || 0
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      if (res.Status === 'success') {
        this.setData({
          isFocus: this.data.isFocus
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorMsg,
          showCancel: false
        })
      }
    })
  },

  /**
   * 选择规格
   * */
  onSelectSku: function (e) {
    console.log('选择事件', this.data.skuSelectedInfo)
    this.data.skuData = {}
    var skuArr = []  // 选择skuid
    if (!Array.isArray(this.data.skuSelectedInfo)) {
      this.data.skuSelectedInfo = this.data.skuSelectedInfo.split(',')
    }
    this.data.skuSelectedInfo[e.target.dataset.index] = e.target.dataset.skutext
    this.data.skuIds[e.target.dataset.index] = {
      AttributeName: e.currentTarget.dataset.key,
      ValueId: e.target.dataset.sku
    }
    skuArr = this.data.skuIds
    if (skuArr.filter((el) => el).length !== this.data.proDetail.skuinfo.length) {
      this.setData({
        skuIds: this.data.skuIds
      })
    } else {
      var arr = []
      this.data.skuIds.map((el) => {
        if (el) {
          arr.push(el.AttributeName + ':' + el.ValueId)
        }
      })
      this.getSkuData(arr.join(','), (data) => {
        console.log('获取sku返回数据',data)
        if (data.errorMsg || data.data.Stock < 0) {
          wx.showToast({
            title: '库存不足，请选择其他规格',
            icon: 'none',
            duration: 2000
          })
          this.data.skuIds[e.target.dataset.index] = null
          this.data.skuSelectedInfo[e.target.dataset.index] = null
          // console.log(this.data.skuIds)
        } else {
          this.data.skuData = data.data[0]
        }
        this.setData({
          skuSelectedInfo: this.data.skuSelectedInfo.filter(el=>el).join(','),
          salePrice: this.data.skuData.SalePrice,
          skuData: this.data.skuData,
          skuIds: this.data.skuIds
        })
      })
    }
  },
 
  /**
   * 减少商品数据 
   */
  onReduce: function (e) {
    if (this.data.count !== 1) {
      console.log('reduce')
      this.data.count--
      this.setData({
        count: this.data.count
      })
    }
  },

  /**
   * 增加商品数据 
   */
  onAdd: function (e) {
    console.log('add')
    if (this.data.integralList) {
      //积分商品限购数，积分商品库存
      if ((this.data.integralList.eachMaxNumber && this.data.integralList.eachMaxNumber <= this.data.count) || this.data.integralList.ProductNumber <= this.data.count) {
        wx.showToast({
          title: '已达到兑换上限！',
          icon: 'none',
          duration: 1500
        })
        return
      }
    } else {
      if (this.data.skuData.Stock <= this.data.count) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }
    this.data.count++
    this.setData({
      count: this.data.count
    })
  },

  // 添加购物车
  onDetailAddCart: function () {
    if (!this.data.skuSelectedInfo || Array.isArray(this.data.skuSelectedInfo)){
      this.setData({
        showSelectDialog: true
      })
      return
    }
    this.onAddCart()
  },
  // 立即兑换
  onDetailConNow: function () {
    if (!this.data.skuSelectedInfo || Array.isArray(this.data.skuSelectedInfo)) {
      this.setData({
        showSelectDialog: true
      })
      return
    }
    this.onConNow()
  },
  // 立即购物
  onDetailBuyNow: function () {
    if (!this.data.skuSelectedInfo || Array.isArray(this.data.skuSelectedInfo)) {
      this.setData({
        showSelectDialog: true
      })
      return
    }
    this.onBuyNow()
  },

  /**
   * 弹窗中的添加购物车
   * */
  onAddCart: function () {
    if (this.data.integralList) {
      //积分商品限购数，积分商品库存
      if ((this.data.integralList.eachMaxNumber && this.data.integralList.eachMaxNumber <= this.data.count) || this.data.integralList.ProductNumber <= this.data.count) {
        wx.showToast({
          title: '已达到兑换上限！',
          icon: 'none',
          duration: 1500
        })
        return
      }
    } else {
      if (this.data.skuData.Stock < this.data.count) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }
    if (!this.data.skuData.SkuId) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    if (!this.data.proDetail.LimitedTimeDiscountInfo) {
      var price = this.data.salePrice
    } else {
      var price = this.data.proDetail.LimitedTimeDiscountInfo[0].FinalPrice
      var LimitedTimeDiscountId = this.data.proDetail.LimitedTimeDiscountInfo[0].LimitedTimeDiscountId
    }
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=AddToShopCart',
      data: {
        limitedTimeDiscountId: LimitedTimeDiscountId || 0,
        quantity: this.data.count,
        SkuId: this.data.skuData.SkuId || 0,
        categoryId: 1,
        Templateid: 0,
        type: 0,
        exchangeId: this.data.exChangeId || 0,
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    }).then(res => {
      console.log(res)
      if (res.Status === 'success') {
        wx.showToast({
          title: '成功添加',
          duration: 1200
        })
        this.setData({
          showSelectDialog: false
        })
        return
      }
      if (res.Status === 'fail') {
        wx.showToast({
          title: res.errorMsg,
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    }).catch(e => { })
  },

  // 弹窗中的立即兑换
  onConNow: function () {
    this.setData({
      showSelectDialog: true
    })
    return
    warrant(data => {
      if (data) {
        if (!this.data.skuData.SkuId) {
          wx.showToast({
            title: '请选择规格',
            icon: 'none'
          })
          return
        }
        this.setOrderData()
        wx.navigateTo({
          url: '/pages/pointOrder/pointOrder'
        })
      }
    })
  },

  // 弹窗中的立即购买
  onBuyNow: function () {
    if (this.data.integralList) {
      //积分商品限购数，积分商品库存
      if ((this.data.integralList.eachMaxNumber && this.data.integralList.eachMaxNumber <= this.data.count) || this.data.integralList.ProductNumber <= this.data.count) {
        wx.showToast({
          title: '已达到兑换上限！',
          icon: 'none',
          duration: 1500
        })
        return
      }
    } else {
      if (this.data.skuData.Stock < this.data.count) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }
    if (!this.data.skuData.SkuId) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetListShoppingCart',
        pageIndex: 1,
        pageSize: 1,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      this.setOrderData()
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder'
      })
    })
  },
  
  // 显示规格选择框
  onShowSku: function () {
    this.setData({
      showSelectDialog: true
    })
  },

  /**
   * 配置立即购买的订单数据
   * */
  setOrderData: function () {
    if (this.data.proDetail.LimitedTimeDiscountInfo) {
      var price = this.data.proDetail.LimitedTimeDiscountInfo[0].FinalPrice
      var LimitedTimeDiscountId = this.data.allData.LimitedTimeDiscountInfo[0].LimitedTimeDiscountId
    } else {
      var price = this.data.salePrice
      var LimitedTimeDiscountId = 0
    }
    if (this.data.integralList) {
      wx.setStorage({
        key: "pointOrder",
        data: JSON.stringify({
          data: [{
            Img: this.data.proDetail.Img[0],
            Price: this.data.salePrice,
            ProductId: this.data.proDetail.productinfo[0].ProductId,
            Quantity: this.data.count,
            SkuContent: '',
            SkuId: this.data.skuData.SkuId,
            Stock: this.data.proDetail.productinfo[0].Stock,
            productName: this.data.proDetail.productinfo[0].ProductName || '',
            ProductNumber: this.data.integralList.ProductNumber || '',
            TemplateId: this.data.proDetail.productinfo[0].TemplateId,
            exChangeId: this.data.integralList.exChangeId || '',
            PointNumber: this.data.integralList.PointNumber || ''
          }],
          itemCount: this.data.count,
          totalPrice: this.data.salePrice * this.data.count
        })
      })
      this.setData({
        showSelectDialog: false
      })
      return
    }
    wx.setStorage({
      key: "confirmOrder",
      data: JSON.stringify({
        data: [{
          LimitedTimeDiscountId: LimitedTimeDiscountId || 0,
          Img: this.data.proDetail.Img[0],
          Price: price,
          ProductId: this.data.proDetail.productinfo[0].ProductId,
          Quantity: this.data.count,
          SkuContent: '',
          SkuId: this.data.skuData.SkuId,
          Stock: this.data.proDetail.productinfo[0].Stock,
          productName: this.data.proDetail.productinfo[0].ProductName,
          TemplateId: this.data.proDetail.productinfo[0].TemplateId,
          LimitedTimeDiscountInfo: LimitedTimeDiscountId
        }],
        itemCount: this.data.count,
        totalPrice: (price * this.data.count).toFixed(2)
      })
    })
    this.setData({
      showSelectDialog: false
    })
  },

  /**
   * 获取商品详情
   * */
  getData: function (id) {
    var _this = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetProductDetail',
        productId: id,
        exChangeId: this.data.exChangeId,
        sessionId: wx.getStorageSync('sessionId') || 0
      }
    }).then(res => {
      if (res.Status === 'success' && !res.data.length) {
        wx.showModal({
          title: '提示',
          content: '商品已下架！',
          showCancel: false,
          success: function () {
            wx.navigateBack({
            })
          }
        })
        return
      }
      console.log('详情：', res)
      if (res.Status === 'success') {
        _this.data.proDetail = res.data[0]
        if (res.data[0].LimitedTimeDiscountInfo) { // 存在限时活动则启动计时器
          countDown(24, res => {
            _this.setData({
              date: res
            })
          })
        }
        if (res.data[0].productinfo[0].MaxShowPrice == res.data[0].productinfo[0].MinShowPrice) {
          _this.data.salePrice = res.data[0].productinfo[0].SalePrice
        } else {
          _this.data.salePrice = res.data[0].productinfo[0].MinShowPrice + (res.data[0].productinfo[0].MaxShowPrice ? '-' + res.data[0].productinfo[0].MaxShowPrice : '')
        }
        _this.data.skuSelectedInfo = new Array(res.data[0].skuinfo.length)
        _this.setData({
          allData: res.data[0],
          isFocus: res.data[0].productinfo[0].IsFavorite ? true : false,
          skuData: {
            Stock: res.data[0].productinfo[0].Stock,
            SkuId: res.data[0].productinfo[0].HasSKU == false ? res.data[0].productinfo[0].SkuId : null
          },
          salePrice: _this.data.salePrice,
          proDetail: _this.data.proDetail,
          // NaughtyPassword: res.data[0].productinfo[0].NaughtyPassword
        })
        var richtext = decodeURIComponent(_this.data.proDetail.productinfo[0].Description)
        WxParse.wxParse('richtext', 'html', richtext, _this, 0);
      } else {
        wx.showToast({
          title: res.data.errorMsg,
          icon: 'none'
        })
        console.log('数据出错')
      }
    })
  },

  /**
   * 获取积分信息
   * */
  getIntegral: function (id, exChangeId) {
    if (this.data.exChangeId != 0) {
      wx.$ajax({
        api: '/API/VshopActivityProcess.ashx?action=PointExchangeProductInfo',
        data: {
          productId: id,
          exChangeId: this.data.exChangeId,
          sessionId: wx.getStorageSync('sessionId') || 0
        },
        showLoading: false
      }).then(res => {
        console.log('积分信息', res.data)
        this.setData({
          integralList: res.data.length ? res.data[0] : null,
        })
      })
    }
  },

  /**
   * 获取评价列表
   * */
  loadEvaluation: function (id) {
    wx.$ajax({
      api: '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetCommodityReviews_VshopProcess',
        productId: id,
        pageIndex: 1,
        pageSize: 3
      },
      showLoading: false,
      showErrModal: false   // 网络错误时禁止显示错误提示框
    }).then(res => {
      if (res.Status === 'success') {
        this.setData({
          evaluationCount: res.data.length,
          evaluationList: res.data
        })
      }
    })
  },

  /**
   * 获取规格信息
   * */
  getSkuData: function (data, callback) {
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetProductSkuOptions',
        productId: this.proId,
        options: data,
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      if (res.Status === 'success') {
        callback(res)
      } else {
        console.log(res.errorMsg)
      }
    })
  }
})