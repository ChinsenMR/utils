// pages/groupBooking/groupBooking.js
var WxParse = require('../../wxParse/wxParse.js');
import {
  warrant,
  turnToLoginPage,
  bindReferralId
} from '../../utils/login.js'
import {
  countDown
} from '../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    proId: '', // 商品id
    proDetail: {}, // 商品详情数据
    tabNum: 0, // 商品详情tabs的id 0商品详情，1商品咨询，2评价
    count: 1, // 商品数量
    position: '', // 商品详情tabs样式
    offsetTop: 0, // 商品详情tabs距离页面顶部距离
    salePrice: 0, // 销售价格
    isEmpty: false, // 是否为空列表
    swiperH: 150, // 轮播组件swiper高度
    isCollect: false, // 是否收藏
    exChangeId: 0, // 活动ID 0是不参与活动商品
    consultationText: '', //咨询详情
    inputTxt: '', //咨询文本域
    allData: [],
    groupInfo: [], //团购信息
    groupTeamInfo: [], //参团信息
    headPrice: 0, //团长价
    joinPrice:0,//参团价
    timeArray: [],
    timer: null, //定时器标识
    NowDate: 0, //当前时间
    countDownList: [], //倒计时
    linktype: 'startGroup', //拼团或单买
    isMoreTrue: false,
    pageIndex:1,
    nowlist:[],
    row:0,
    skuSelectedInfo: null, // 选中的sku info
    skuIds: [], // 选中的sku值
    skuData: {}, // 获取的sku数据
    showSelectDialog: false, // 显示sku选择框
    collageTeamId:'',
    joinFriendGroup:false, //是否由朋友邀请参团
    groupTeamId:0
  },

  // 关闭弹窗
  onCloseDialog: function () {
    this.setData({
      showSelectDialog: false
    })
  },
  
  //点击更多
  showMore: function() {
    this.setData({
      isMoreTrue: true
    })
    let _this = this
    wx.request({
      url: getApp().data.url + '/API/VshopCollageProcess.ashx',
      data: {
        action: 'GetCollageTeamByTeamId',
        pageIndex:1,
        pageSize:10,
        collageActivityId: this.data.groupInfo.CollageActivityId,
        productId: this.data.proDetail.productinfo[0].ProductId
      },
      success: function (res) {
        if (res.data.Status === 'success') {
          console.log(res.data)
          _this.data.row = res.data.data.length
          _this.data.nowlist = _this.data.nowlist.concat(res.data.data)
          _this.setData({
            nowlist: _this.data.nowlist
          })
          console.log(_this.data.nowlist)
        }
      },
      fail: function (e) {
        wx.hideLoading()
      }
    })
  },

  hiddenMore: function() {
    this.setData({
      isMoreTrue: false
    })
  },

  // 禁止屏幕滚动
  preventTouchMove: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setStorage({
      key: 'onGoods',
      data: true,
    })
    if (options.ReferralId) {
      wx.setStorageSync('ReferralId', options.ReferralId)
      setTimeout(() => {
        bindReferralId(options.ReferralId)
      }, 1000)
    }
    if (options.scene) {
      wx.setStorageSync('ReferralId', decodeURIComponent(options.scene))
      setTimeout(() => {
        bindReferralId(decodeURIComponent(options.scene))
      }, 1000)
    }
    if (options.groupTeamId){
      wx.showModal({
        title: '提示',
        content: '点击购买加入好友拼团',
      })
      this.setData({
        joinFriendGroup: true,
        groupTeamId: options.groupTeamId
      })
    }
    this.data.proId = options.id
    console.log(options)
    wx.showLoading({
      title: '页面加载中...',
    })
    this.getData(options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      tabNum: 0
    })
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

  //商品咨询
  toConsultative: function() {
    var ID = this.data.proDetail.productinfo[0].ProductId
    wx.navigateTo({
      url: '/pages/Consultative/Consultative?productId=' + ID,
    })
  },

  /**
   * 滚动监听
   * */
  onPageScroll: function(e) {
    if (!this.data.isScrollRun) { // 判断是否空闲
      return
    }
    this.data.isScrollRun = false
    setTimeout(() => {
      var _this = this
      console.log('滚')
      var query = wx.createSelectorQuery()
      query.select('#prodetailNav').boundingClientRect(function(res) {
        if (res != null) {
          _this.data.offsetTop = res.top
          if (res.top <= 10) {
            _this.data.position = 'position: fixed;top:0;left:0;width:100%;z-index:10;background:#fff;'
          } else {
            _this.data.position = ''
          }
          _this.data.isScrollRun = true
          _this.setData({
            position: _this.data.position
          })
        }
      }).exec()
    }, 300)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    let path = wx.getStorageSync('ReferralId') ? '/pages/productDetail/productDetail?ReferralId=' + wx.getStorageSync('ReferralId') + '&id=' + this.data.proDetail.productinfo[0].ProductId : '/pages/productDetail/productDetail?id=' + this.data.proDetail.productinfo[0].ProductId
    return {
      title: this.data.proDetail.productinfo[0].ProductName,
      path: path
    }
  },

  /**
   * 图片加载完成事件,动态设置swiper高度
   * */
  onLoadImg: function(e) {
    if (this.data.swiperH !== 150) {
      return
    }
    // console.log('设置swiper高度', e)
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
          ProductId: this.data.proDetail.productinfo[0].ProductId,
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
   * 预览图片
   * */
  previewImage: function(e) {
    wx.previewImage({
      urls: this.data.proDetail.Img,
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
    if (this.data.skuData.Stock <= this.data.count) {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 1500
      })
      return
    }
    if (this.data.proDetail.LimitedTimeDiscountInfo) {
      if (this.data.proDetail.LimitedTimeDiscountInfo[0].LimitNumber === this.data.count) {
        wx.showToast({
          title: '当前商品限购' + this.data.proDetail.LimitedTimeDiscountInfo[0].LimitNumber + '件！超出恢复原价',
          icon: 'none',
          duration: 1500
        })
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
    if (e.target.dataset.tab == 1) {} else if (e.target.dataset.tab == 2) {}
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
        console.log('获取sku返回数据', data)
        if (data.errorMsg || data.data.Stock < 0) {
          wx.showToast({
            title: '库存不足，请选择其他规格',
            icon: 'none',
            duration: 2000
          })
          this.data.skuIds[e.target.dataset.index] = null
          this.data.skuSelectedInfo[e.target.dataset.index] = null
        } else {
          this.data.skuData = data.data[0]
        }
        this.setData({
          skuSelectedInfo: this.data.skuSelectedInfo.filter(el => el).join(','),
          salePrice: this.data.skuData.SalePrice ? this.data.skuData.SalePrice : 0,
          headPrice: this.data.skuData.CollageActivityHeadPrice ? this.data.skuData.CollageActivityHeadPrice : 0,
          joinPrice: this.data.skuData.CollageActivitySalePrice ? this.data.skuData.CollageActivitySalePrice : 0,
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
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'GetProductSkuOptions',
        productId: this.data.proDetail.productinfo[0].ProductId,
        collageProductId: this.data.proId,
        options: data,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        if (res.data.Status === 'success') {
          callback(res.data)
        } else {
          console.log(res.data.errorMsg)
        }
      },
      fail: function(e) {
        wx.hideLoading()
      }
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
    //满减优惠金额
    let totalDiscounts = 0
    if (this.data.allData.ActivityInfo) {
      var arr = this.data.allData.ActivityInfo
      var proMoney = this.data.salePrice * this.data.count
      console.log(proMoney)
      arr.map(el => {
        if (el.MeetMoney > 0 && proMoney >= el.MeetMoney) {
          totalDiscounts += el.ReductionMoney
        }
      })
      console.log(totalDiscounts)
    } else {
      totalDiscounts = 0
    }
    if (this.data.linktype === 'startGroup') {
      price = this.data.headPrice
    } else if (this.data.linktype === 'joinGroup'){
      price = this.data.joinPrice
    }
    wx.setStorage({
      key: "confirmOrder",
      data: JSON.stringify({
        data: [{
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
        totalPrice: (price * this.data.count - totalDiscounts).toFixed(2),
        discountMoney: totalDiscounts
      })
    })
  },

  // 立即购物
  onDetailBuyNow: function (e) {
    var linktype = e.currentTarget.dataset.type
    this.setData({
      linktype: linktype,
      showSelectDialog: true
    })
    if (linktype ==='joinGroup'){
      this.setData({
        isMoreTrue:false,
        collageTeamId: e.currentTarget.dataset.teamid
      })
    }
  },

  /**
   * 单独购买
   * */
  onBuyNow: function(e) {
    console.log(e)
    var linktype = this.data.linktype
    if (!this.data.skuData.SkuId) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    if (this.data.proDetail.productinfo[0].Stock === 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    if (this.data.proDetail.CollageAtivityInfo[0].LimitNumber>0&&this.data.count> this.data.proDetail.CollageAtivityInfo[0].LimitNumber){
      wx.showToast({
        title: '超过限制每人购买数量',
        icon: 'none'
      })
      return
    }
    let _this = this
    wx.request({
      url: getApp().data.url +'/Vshop/Collage/CollageHandler.ashx',
      data: {
        action: 'CheckHasBuyCount',
        sessionId: wx.getStorageSync('sessionId'),
        ActivityId: this.data.proDetail.CollageAtivityInfo[0].CollageActivityId
      },
      success: function (res) {
        if (res.data.Status=='True'){
          _this.onBuyNowShow(linktype,_this);
        }else{
          wx.showToast({
            title: '您参与的拼团活动可购买商品数量已达上限!',
            icon: 'none'
          })
          return
        }
      },
      fail: function (e) { }
    })
  },
  onBuyNowShow: function (linktype, _this){
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx',
      data: {
        action: 'CheckMemberIsShopping',
        sessionId: wx.getStorageSync('sessionId'),
        productId: this.data.proDetail.productinfo[0].ProductId
      },
      success: function (res) {
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin'
          })
          return
        }
        if (res.data.Status === 'success') {
          if (linktype == 'single') {
            wx.navigateTo({
              url: '/pages/confirmOrder/confirmOrder'
            })
          } else if (linktype == 'startGroup') {
            wx.setStorage({
              key: 'join&create',
              data: JSON.stringify({
                createTeam: true,
                collageActivityId: _this.data.groupInfo.CollageActivityId, //参团活动ID
                collageTeamId: '' //参团团队ID
              }),
            })
            wx.navigateTo({
              url: '/pages/groupOrder/groupOrder',
            })
          } else if (linktype == 'joinGroup') {
            wx.setStorage({
              key: 'join&create',
              data: JSON.stringify({
                createTeam: false,
                collageActivityId: _this.data.groupInfo.CollageActivityId, //参团活动ID
                collageTeamId: _this.data.collageTeamId  //参团团队ID
              }),
            })
            wx.navigateTo({
              url: '/pages/groupOrder/groupOrder',
            })
          }
          _this.setOrderData()
        }
        if (res.data.Status === 'fail') {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            mask: true
          })
        }
      },
      fail: function (e) { }
    })
  },

  /**
   * 获取商品详情
   * */
  getData: function(id, exChangeId) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopCollageProcess.ashx',
      data: {
        action: 'GetProductDetailsByCollageActivity',
        CollageProductId: id,
        exChangeId: this.data.exChangeId,
         sessionId: wx.getStorageSync('sessionId')
      },
      headers: {
        'Content-Type': 'application/json'
      },
      success: function(res) {
        console.log(res.data)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          _this.data.proDetail = res.data.data[0]
          // 价格显示
          if (res.data.data[0].LimitedTimeDiscountInfo){
            //如果有限时折扣
            _this.data.salePrice = res.data.data[0].LimitedTimeDiscountInfo[0].FinalPrice
          }else{
            if (res.data.data[0].productinfo[0].MaxShowPrice == res.data.data[0].productinfo[0].MinShowPrice) {
              _this.data.salePrice = res.data.data[0].productinfo[0].SalePrice
            } else {
              _this.data.salePrice = res.data.data[0].productinfo[0].MinShowPrice + '' + (res.data.data[0].productinfo[0].MaxShowPrice ? '-' + res.data.data[0].productinfo[0].MaxShowPrice : '')
            }
          }
          //小伙伴发起的拼团
          if (res.data.data[0].CollageActivityTeams) {
            _this.data.groupTeamInfo = res.data.data[0].CollageActivityTeams
          }
          // 参团价
          if (res.data.data[0].CollageAtivityInfo[0].CollageActivitySku.length) {
            var headPrice = res.data.data[0].CollageAtivityInfo[0].CollageActivitySku[0].HeadPrice
            var joinPrice = res.data.data[0].CollageAtivityInfo[0].CollageActivitySku[0].SalePrice
          } else {
            //拼团折扣
            var count = ((res.data.data[0].CollageAtivityInfo[0].HeadDiscount) * 0.01).toFixed(2) //开团折扣
            var joinCount = ((res.data.data[0].CollageAtivityInfo[0].DefaultDiscount) * 0.01).toFixed(2) //拼团折扣
            if (res.data.data[0].productinfo[0].MaxShowPrice == res.data.data[0].productinfo[0].MinShowPrice) {
              //最大价等于最小价时
              var headPrice = parseFloat((res.data.data[0].productinfo[0].SalePrice) * count).toFixed(2)
              var joinPrice = parseFloat((res.data.data[0].productinfo[0].SalePrice) * joinCount).toFixed(2)
            } else {
              var headPrice = ((res.data.data[0].productinfo[0].MinShowPrice * count).toFixed(2)) + '' + (res.data.data[0].productinfo[0].MaxShowPrice ? '-' + ((res.data.data[0].productinfo[0].MaxShowPrice * count).toFixed(2)) : '')
              var joinPrice = ((res.data.data[0].productinfo[0].MinShowPrice * joinCount).toFixed(2)) + '' + (res.data.data[0].productinfo[0].MaxShowPrice ? '-' + ((res.data.data[0].productinfo[0].MaxShowPrice * joinCount).toFixed(2)) : '')
            }
          }
          //时间
          var NowDate = new Date(res.data.NowDate).getTime(),
            BeginTime = new Date(res.data.data[0].CollageAtivityInfo[0].BeginTime).getTime(),
            EndTime = new Date(res.data.data[0].CollageAtivityInfo[0].EndTime).getTime(),
            timeArray = [BeginTime, EndTime]
          _this.data.skuSelectedInfo = new Array(res.data.data[0].skuinfo.length)
          _this.setData({
            allData: res.data.data[0],
            groupTeamInfo: _this.data.groupTeamInfo,
            groupInfo: res.data.data[0].CollageAtivityInfo[0],
            isCollect: res.data.data[0].productinfo[0].IsFavorite ? true : false,
            skuData: {
              Stock: res.data.data[0].productinfo[0].Stock,
              SkuId: res.data.data[0].productinfo[0].HasSKU == false ? res.data.data[0].productinfo[0].SkuId : null
            },
            salePrice: _this.data.salePrice,
            proDetail: _this.data.proDetail,
            headPrice: headPrice, //开团价格
            joinPrice: joinPrice,//参团价格
            NowDate: NowDate, //服务器时间
            timeArray: timeArray
          }, () => {
            wx.hideLoading()
          })
          console.log(_this.data.joinPrice)
          _this.countDown();
          var richtext = decodeURI(_this.data.proDetail.productinfo[0].Description)
          WxParse.wxParse('richtext', 'html', richtext, _this, 0);
        } else {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
          console.log('数据出错')
        }
      },
      fail: function(e) {
        wx.hideLoading()
      }
    })
  },

  //小于10的格式化函数 
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },

  //倒计时函
  countDown() {
    let newTime = this.data.NowDate; // 当前服务器时间
    let endTime = this.data.timeArray[1]; //活动结束时间数组
    let countDownArr = []; // 对结束时间进行处理渲染到页面 
    let obj = null; // 如果活动未结束，对时间进行处理 
    if (endTime - newTime > 0) {
      let time = (endTime - newTime) / 1000; // 获取天、时、分、秒 
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      let ms = parseInt(((time * 1000) % 1000) / 100)
      obj = {
        day: this.timeFormat(day),
        hou: this.timeFormat(hou),
        min: this.timeFormat(min),
        sec: this.timeFormat(sec),
        ms: ms
      }
    } else { //活动已结束，全部设置为'00' 
      clearTimeout(this.data.timer)
      obj = {
        day: '00',
        hou: '00',
        min: '00',
        sec: '00',
        ms: '0'
      }
    }
    countDownArr.push(obj);
    this.setData({
      countDownList: countDownArr,
      NowDate: parseInt(this.data.NowDate + 100)
    })
    this.data.timer = setTimeout(this.countDown, 100);
  }
})