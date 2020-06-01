// pages/productDetail/productDetail.js
import {
  warrant,
  bindReferralId,
  turnToLoginPage
} from '../../utils/login.js';
import {
  throttle
} from '../../utils/util.js';
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceList: [],
    showPicker: true,
    indexs: 0,
    isScrollRun: true,
    proId: '', // 商品id
    proDetail: {}, // 商品详情数据
    tabNum: 0, // 商品详情tabs的id 0商品详情，1商品咨询，2评价
    skuIds: [], // 选中的sku值
    skuData: {}, // 获取的sku数据
    count: 1, // 商品数量
    position: '', // 商品详情tabs样式
    offsetTop: 0, // 商品详情tabs距离页面顶部距离
    page: 1, // 请求评价列表当前页
    dataLength: 0, // 每次获评价列表长度
    dataList: [], // 评价列表
    salePrice: 0, // 销售价格
    isEmpty: false, // 是否为空列表
    swiperH: 150, // 轮播组件swiper高度
    isCollect: false, // 是否收藏
    exChangeId: '', // 活动ID 0是不参与活动商品
    integralList: null, //积分详情
    consultationText: '', //咨询详情
    allData: [], //商品详情
    inputTxt: '', //咨询文本域
    proDetail_node: '', //商品详情
    isFullIphone: false, //是否为iPhone X以上的全面屏
    isInRange: 1,
    paramOption: {},
    // NaughtyPassword: '' // 淘口令
  },
  showModel: function() {},
  showPicker: function() {
    this.setData({
      showPicker: false
    })
  },
  oncancel: function() {
    this.setData({
      showPicker: true
    })
  },
  watchInput: function(e) {
    console.log('input数据', e.detail)
    this.setData({
      count: e.detail.value
    })
    if (e.detail.value === '' || e.detail.value.length >= 7) {

    }
  },
  bindChange: function(e) {
    this.setData({
      indexs: e.detail.value[0]
    })
    console.log(e.detail.value[0])
  },
  toCustomer: function(e) {
    var _this = this
    var id = e.currentTarget.dataset.id
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'CheckUserConsultAmount',
        CsId: id,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        console.log(res)
        // 登陆
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin',
          })
        }
        if (res.data.Status === "success") {
          wx.showLoading({
            title: '',
          })
          wx.setStorage({
            key: 'firstCardId',
            data: JSON.stringify({
              ProductId: _this.data.proId,
              ProductName: _this.data.proDetail.productinfo[0].ProductName,
              ProductImg: _this.data.proDetail.Img[0],
              ProductPrice: _this.data.salePrice,
              type: 'goodsCard'
            })
          })
          setTimeout(function() {
            wx.navigateTo({
              url: '/pages/CustomerService/CustomerService?onCustomer=true&id=' + id,
            })
          }, 1500)
        }
        if (res.data.Status === "fail") {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            mask: true
          })
        }
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },

  //请求客服列表
  getCustomer: function() {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetOnlineCsManagerInfo'
      },
      success: function(res) {
        if (res.data.Status === 'success') {
          wx.hideLoading()
          console.log(res.data)
          _this.setData({
            serviceList: res.data.data
          })
        }
        if (res.data.Status === 'Enable') {
          // wx.showToast({
          //   title: res.data.errorMsg,
          //   icon: 'none',
          //   duration: 2000
          // })
        }
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },

  onUnload: function() {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('参数', options)
    this.setData({
      paramOption: options
    })
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
    this.setData({
      skuIds: [],
      count: 1
    })
    var options = this.data.paramOption
    console.log('onshow', options)

    if (options.scene) {
      let scene = decodeURIComponent(options.scene).split('&')
      console.log('二维码分享：', scene)
      this.data.proId = scene[0]
      wx.setStorageSync('ReferralId', scene[1])
      bindReferralId(scene[1])
    } else {
      if (options.id) {
        this.data.proId = options.id
      }
      if (options.ReferralId) {
        wx.setStorageSync('ReferralId', options.ReferralId)
        bindReferralId(options.ReferralId)
      }
      var isFullIphone = getApp().globalData.isFullIphone
      this.setData({
        exChangeId: options.exChangeId || 0,
        isFullIphone: isFullIphone
      })

    }

    wx.showLoading({
      title: '页面加载中...',
    })
    this.getData(this.data.proId)
    this.getIntegral(this.data.proId)
    // this.getCustomer()
    this.setData({
      tabNum: 0
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.tabNum === 2 && this.data.dataLength == 10) {
      // console.log('加载')
      this.data.page++
        this.getDataList()
    } else {
      console.log('没了')
    }
  },

  /**
   * 滚动监听
   * */
  // onPageScroll: function (e) {
  //   let _this = this
  //   throttle(()=>{
  //     var query = wx.createSelectorQuery()
  //     query.select('#prodetailNav').boundingClientRect(function (res) {
  //       if (res != null) {
  //         _this.data.offsetTop = res.top
  //         if (res.top <= 10) {
  //           _this.data.position = 'position: fixed;top:0;left:0;width:100%;z-index:10;background:#fff;'
  //         } else {
  //           _this.data.position = ''
  //         }
  //         _this.setData({
  //           position: _this.data.position
  //         })
  //       }
  //     }).exec()
  //   }, 300, 100)()
  // },

  // 监听滚动事件
  onPageScroll: function(data) {
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
  onShareAppMessage: function() {
    let path;
    if (wx.getStorageSync("ReferralId")) {
      path = "/pages/productDetail/productDetail?id=" + this.data.proId + "&ReferralId=" + wx.getStorageSync("ReferralId")
    } else {
      path = "/pages/productDetail/productDetail?id=" + this.data.proId
    }
    console.log(path)
    return {
      title: this.data.proDetail.productinfo[0].ProductName,
      path: path
    }
  },

  //商品咨询
  toConsultative: function() {
    wx.navigateTo({
      url: '/pages/Consultative/Consultative?productId=' + this.data.proId,
    })
  },

  /**
   * 图片加载完成事件,动态设置swiper高度
   * */
  onLoadImg: function(e) {
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
   * 收藏商品
   * */
  onCollect: function() {
    this.data.isCollect = !this.data.isCollect
    this.addTofavortie(this.data.isCollect ? 1 : 0).then(res => {
      console.log(res)
      this.setData({
        isCollect: this.data.isCollect
      })
    }).catch(e => {
      wx.showToast({
        title: '收藏提交失败',
      })
      console.log('收藏err', e)
    })
  },

  /**
   * 添加/取消收藏--http
   * */
  addTofavortie: function(data) {
    return new Promise((resovle, reject) => {
      wx.request({
        url: getApp().data.url + '/Api/VshopProcess.ashx?action=AddToFavorite',
        data: {
          ProductId: this.data.proId,
          IsFavorite: data,
          sessionId: wx.getStorageSync('sessionId') || 0
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          // 登陆
          if (res.data.Status === 'login') {
            turnToLoginPage()
          }
          if (res.data.Status === 'success') {
            resovle(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: function(e) {
          reject(e)
        }
      })
    })
  },

  /**
   * 配置立即购买的订单数据
   * */
  setOrderData: function() {
    if (this.data.proDetail.LimitedTimeDiscountInfo) {
      var price = this.data.proDetail.LimitedTimeDiscountInfo[0].FinalPrice
      var LimitedTimeDiscountId = this.data.allData.LimitedTimeDiscountInfo[0].LimitedTimeDiscountId
    } else {
      var price = this.data.salePrice
      var LimitedTimeDiscountId = 0
    }
    //满减优惠金额
    let totalDiscounts = 0
    if (this.data.allData.ActivityInfo) {
      var arr = this.data.allData.ActivityInfo
      var proMoney = this.data.salePrice * this.data.count
      console.log(proMoney)
      arr.map(el => {
        if (el.MeetMoney > 0 && proMoney >= el.MeetMoney) {
          totalDiscounts += el.ReductionMoney
        } else {
          if (el.MeetNumber > 0 && this.data.count >= el.MeetNumber) {
            totalDiscounts += el.ReductionMoney
          }
        }
      })
      console.log(totalDiscounts)
    } else {
      totalDiscounts = 0
    }
    var valueStr = "";
    var skuArr = this.data.skuIds;
    if (skuArr && skuArr.length > 0) {
      skuArr.map(function(o) {
        valueStr = valueStr + "  " + o.Name + ":" + o.valuestr + " ; "
      })
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
          LimitedTimeDiscountInfo: LimitedTimeDiscountId,
          valueStr: valueStr
        }],
        itemCount: this.data.count,
        totalPrice: (price * this.data.count - totalDiscounts).toFixed(2),
        discountMoney: totalDiscounts
      })
    })
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
    }

  },

  /**
   * 预览图片
   * */
  previewImage: function(e) {
    var index = e.target.dataset.index
    console.log(this.data.proDetail)
    wx.previewImage({
      urls: this.data.proDetail.Img,
      current: this.data.proDetail.Img[index]
    })
  },

  /**
   * 减少商品数据 
   */
  onReduce: function(e) {
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
  onAdd: function(e) {
    console.log('add')
    if (this.data.integralList) {
      if (this.data.integralList.ProductNumber > 0 && this.data.integralList.ProductNumber <= (this.data.integralList.ExChangedNumbe + this.data.count)) {
        wx.showToast({
          title: '超过发放数量',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }
    if (this.data.allData && this.data.allData.LimitedTimeDiscountInfo) {
      if (this.data.allData.LimitedTimeDiscountInfo.length > 0 && this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber > 0) {
        if (this.data.count >= (this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber - this.data.allData.LimitedTimeDiscountInfo[0].UsedNum)) {
          wx.showToast({
            title: '超过限购' + this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber + '件的数量',
            icon: 'none',
            duration: 1500
          })
          return
        }
      }
    }


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

  /**
   * tabs点击事件处理函数（选择商品详情、商品咨询、评价）
   * */
  onChangeTabs: function(e) {
    console.log('tabs', e)
    this.setData({
      tabNum: parseInt(e.target.dataset.tab)
    })
    if (e.target.dataset.tab == 1) {} else if (e.target.dataset.tab == 2) {
      this.getDataList(true)
    }
  },

  /**
   * 选择规格
   * */
  onSelectSku: function(e) {
    this.data.skuData = {}
    var skuArr = []
    this.data.skuIds[e.target.dataset.index] = {
      AttributeName: e.currentTarget.dataset.key,
      ValueId: e.target.dataset.sku,
      valuestr: e.target.dataset.valuestr,
      Name: e.target.dataset.name
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
        console.log(data)
        if (data.errorMsg || data.data.Stock < 0) {
          wx.showToast({
            title: '库存不足，请选择其他规格',
            icon: 'none',
            duration: 2000
          })
          this.data.skuIds[e.target.dataset.index] = null
          console.log(this.data.skuIds)
        } else {
          this.data.skuData = data.data[0]
        }
        console.log(this.data.skuData)
        this.setData({
          salePrice: this.data.skuData.SalePrice,
          skuData: this.data.skuData,
          skuIds: this.data.skuIds
        })
      })
    }
  },

  /**
   * 获取规格信息
   * */
  getSkuData: function(data, callback) {
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'GetProductSkuOptions',
        productId: this.data.proId,
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
  },

  /**
   * 添加购物车
   * */
  onAddCart: function() {

    if (this.data.allData && this.data.allData.LimitedTimeDiscountInfo && this.data.allData.LimitedTimeDiscountInfo.length > 0 && this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber > 0) {
      if (this.data.count > (this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber - this.data.allData.LimitedTimeDiscountInfo[0].UsedNum)) {
        wx.showToast({
          title: '超过限购' + this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber + '件的数量',
          icon: 'none',
          duration: 1500
        })
        return
      }
    }

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
    }).catch(e => {})
  },

  /**
   * 立即购物
   * */
  onBuyNow: function() {
    if (this.data.allData && this.data.allData.LimitedTimeDiscountInfo) {
      if (this.data.allData.LimitedTimeDiscountInfo.length > 0 && this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber > 0) {
        if (this.data.count > (this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber - this.data.allData.LimitedTimeDiscountInfo[0].UsedNum)) {
          wx.showToast({
            title: '超过限购' + this.data.allData.LimitedTimeDiscountInfo[0].LimitNumber + '件的数量',
            icon: 'none',
            duration: 1500
          })
          return
        }
      }
    }
    if (this.data.integralList) {
      //积分商品限购数，积分商品库存
      // if ((this.data.integralList.eachMaxNumber && this.data.integralList.eachMaxNumber <= this.data.count) || this.data.integralList.ProductNumber <= this.data.count) {
      //   wx.showToast({
      //     title: '已达到兑换上限！',
      //     icon: 'none',
      //     duration: 1500
      //   })
      //   return
      // }
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
    var that = this;
    wx.$ajax({
      api: '/Api/VshopProcess.ashx',
      data: {
        action: 'CheckMemberIsShopping',
        pageIndex: 1,
        pageSize: 1,
        sessionId: wx.getStorageSync('sessionId'),
        productId: that.data.proId
      }
    }).then(res => {
      if (res.Status == 'fail') {
        wx.showToast({
          title: res.errorMsg,
          icon: 'none'
        })
        return
      }
      console.log(res.errorMsg == '购物车中未添加商品', '========');
      this.setOrderData()
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder'
      })
    })

  },

  /**
   * 立即兑换
   * */
  onConNow: function() {
    if (this.data.isInRange == 0) {
      wx.showToast({
        title: '不能兑换，没有权限',
        icon: 'none'
      })
      return;
    }
    warrant(data => {
      if (data) {
        if (!this.data.skuData.SkuId) {
          wx.showToast({
            title: '请选择规格',
            icon: 'none'
          })
          return
        }

        if (this.data.integralList) {
          if (this.data.integralList.ProductNumber > 0 && this.data.integralList.ProductNumber < (this.data.integralList.ExChangedNumbe + this.data.count)) {
            wx.showToast({
              title: '超过发放数量',
              icon: 'none',
              duration: 1500
            })
            return
          }
        }
        if ((this.data.integralList.eachMaxNumber > 0 && this.data.integralList.UserExChangedNumbe >= this.data.integralList.eachMaxNumber) || this.data.integralList.ExChangedNumbe > this.data.integralList.ProductNumber) {
          wx.showToast({
            title: '当前已达最大兑换数',
            icon: 'none',
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


  /**
   * 获取积分信息
   * */
  getIntegral: function(id, exChangeId) {
    if (this.data.exChangeId != 0) {
      wx.$ajax({
        api: '/API/VshopActivityProcess.ashx?action=PointExchangeProductInfo',
        data: {
          productId: id,
          exChangeId: this.data.exChangeId,
          sessionId: wx.getStorageSync('sessionId') || 0
        }
      }).then(res => {
        console.log('积分信息', res.data)
        this.setData({
          isInRange: res.data[0].isInRange,
          integralList: res.data.length ? res.data[0] : null,
        })
      })
    }
  },

  /**
   * 获取商品详情
   * */
  getData: function(id, exChangeId) {
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
          success: function() {
            wx.navigateBack({})
          }
        })
        return
      }
      console.log('详情：', res)
      if (res.Status === 'success') {
        _this.data.proDetail = res.data[0]
        if (res.data[0].productinfo[0].MaxShowPrice == res.data[0].productinfo[0].MinShowPrice) {
          _this.data.salePrice = res.data[0].productinfo[0].SalePrice
        } else {
          _this.data.salePrice = res.data[0].productinfo[0].MinShowPrice + '' + (res.data[0].productinfo[0].MaxShowPrice ? '-' + res.data[0].productinfo[0].MaxShowPrice : '')
        }
        _this.setData({
          allData: res.data[0],
          isCollect: res.data[0].productinfo[0].IsFavorite ? true : false,
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
    }).catch(e => {})
  },

  //获取咨询内容
  consultInput: function(e) {
    // console.log(e)
    this.setData({
      consultInput: e.detail.value
    })
  },

  /**
   * 获取评价列表
   * */
  getDataList: function(firsttime) {
    if (firsttime) {
      this.setData({
        page: 1,
        dataList: []
      })
    }
    var _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetCommodityReviews_VshopProcess',
        productId: this.data.proId,
        pageIndex: this.data.page,
        pageSize: 10
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.Status === 'success') {
          _this.data.dataLength = res.data.data.length
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i] && res.data.data[i]["ReviewDate"]) {
              res.data.data[i]["ReviewDate"] = res.data.data[i]["ReviewDate"].replace('T', ' ');
              res.data.data[i]["ReviewDate"] = res.data.data[i]["ReviewDate"].substring(0, 16);
            }
          }
          _this.data.dataList = _this.data.dataList.concat(res.data.data)
          _this.setData({
            dataList: _this.data.dataList,
            isEmpty: res.data.data.length ? false : true
          })
        } else {
          console.log('数据出错')
          _this.data.dataLength = 0
          _this.setData({
            isEmpty: true
          })
        }
      },
      fail: function(e) {
        _this.data.dataLength = 0
        _this.setData({
          isEmpty: true
        })
        wx.hideLoading()
      }
    })
  }
})