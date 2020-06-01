import {
  bindReferralId
} from "../../utils/login.js"
import {
  throttle
} from '../../utils/util.js'
import { str, keys } from "../../utils/emoji-data.js"
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    imgUrls: [],
    noticeData: {},
    noteList: [
      // '换肤清洁大作战 满199减100，你知道吗？',
      // '五一端午攻略来袭（最赞旅行面膜总结）',
      // ''
    ],
    showWindow: false,// 弹窗
    swiperH: 150,
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    indicatorColor: "#941435",
    tabList: [],
    cur: 0,
    navList: [],
    newPeople: [],
    activity: [],
    demolist: [],
    indexData: [],
    windowWidth: 0,
    windowHeight: 0,
    clientY: '80%',
    clientX: '85%',
    EnableRobot: '',
    EnableCS: '',
    liveSwiperForm: {
      background: [],
      indicatorDots: true,
      vertical: false,
      autoplay: true,
      interval: 2000,
      duration: 500
    },
    noticeSwiperForm: {
      background: [],
      indicatorDots: true,
      vertical: false,
      autoplay: true,
      interval: 2000,
      duration: 500
    },
  },
  dataSize: 10, // 每次渲染数据量
  index: 0, // 记录显示数组（indexData）的长度
  totalCount: 0, // 加载数据总长度
  allData: [], // 加载的总数据


  /**start 直播入口模块 */
  changeIndicatorDots() {
    this.setData({
      'liveSwiperForm.indicatorDots': !this.data.liveSwiperForm.indicatorDots
    })
  },
  changeAutoplay() {
    this.setData({
      'liveSwiperForm.autoplay': !this.data.liveSwiperForm.autoplay
    })
  },

  intervalChange(e) {
    this.setData({
      'liveSwiperForm.interval': e.detail.value
    })
  },

  durationChange(e) {
    this.setData({
      'liveSwiperForm.duration': e.detail.value
    })
  },


  changeIndicatorDots() {
    this.setData({
      'noticeSwiperForm.indicatorDots': !this.data.noticeSwiperForm.indicatorDots
    })
  },
  changeAutoplay() {
    this.setData({
      'noticeSwiperForm.autoplay': !this.data.noticeSwiperForm.autoplay
    })
  },

  intervalChange(e) {
    this.setData({
      'noticeSwiperForm.interval': e.detail.value
    })
  },

  durationChange(e) {
    this.setData({
      'noticeSwiperForm.duration': e.detail.value
    })
  },



  // 获取轮播图片列表
  getNoticeCover() {
    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data: {
        action: 'GetLiveNoticeBg'
      }
    }).then(res => {
      console.log(222)
      const { LiveNoticeSet } = res.data;
      if (res.data && LiveNoticeSet && LiveNoticeSet.BgImgUrl) {
        this.setData({
          noticeData: LiveNoticeSet,
          showWindow: true
        })
      } else {
        this.setData({
          showWindow: false
        })
      }

    })

  },

  // 获取轮播图片列表
  getSwipers() {
    wx.$ajax({
      api: '/api/MiniProgramLive/api.ashx',
      data: {
        action: 'GetLiveNoticeList',
        sessionId: wx.getStorageSync('sessionId'),
      }
    }).then(res => {
      console.log(res)
      let { LivingList, NoticeList } = res.data;
      console.log(LivingList)
      // liveSwiperForm

      this.setData({
        'liveSwiperForm.background': LivingList,
        'noticeSwiperForm.background': NoticeList
      })
    })

  },

  /**直播入口模块 end */

  btn_move: function (e) {
    var yaxes = parseInt((e.changedTouches[0].clientY - 20)),
      xaxes = parseInt((e.changedTouches[0].clientX - 20))
    this.setData({
      clientY: yaxes + 'px',
      clientX: xaxes + 'px'
    })
  },
  btn_end: function (e) {
    var width = parseInt((this.data.windowWidth) / 2),
      yaxes = parseInt((e.changedTouches[0].clientY - 20)),
      xaxes = parseInt((e.changedTouches[0].clientX - 20))
    if (xaxes + 20 > width) {
      var xaxes = '85%'
    } else {
      var xaxes = '5%'
    }
    if (yaxes < 100) {
      var yaxes = '20%'
    } else {
      if (this.data.windowHeight - yaxes <= 100) {
        var yaxes = '80%'
      } else {
        var yaxes = yaxes + 'px'
      }
    }
    this.setData({
      clientY: yaxes,
      clientX: xaxes
    })
  },

  //链接客服判断
  linkCustomer: function () {
    var _this = this;
    if (_this.data.EnableRobot == 'True') {
      wx.request({
        url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
        data: {
          action: 'CheckUserConsultAmount',
          CsId: -100,
          sessionId: wx.getStorageSync('sessionId')
        },
        success: function (res) {
          console.log(res)
          // 登陆
          if (res.data.Status === 'login') {
            wx.navigateTo({
              url: '/pages/authorizationLogin/authorizationLogin',
            })
          }
          if (res.data.Status === "success") {
            wx.navigateTo({
              url: '/pages/CustomerService/CustomerService?onRobot=true&id=-100',
            })
          }
          if (res.data.Status === "fail") {
            wx.showToast({
              title: res.data.errorMsg,
              icon: 'none',
              mask: true
            })
          }
        },
        fail: function (e) {
          console.log(e)
        }
      })
      return
    } else {
      wx.navigateTo({
        url: '/pages/headingCode/headingCode',
      })
    }
  },

  onLoad: function (options) {
    var _this = this
    wx.getSystemInfo({
      success(res) {
        _this.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })
      }
    })
    wx.stopPullDownRefresh()
    // 开启转发功能
    wx.showShareMenu({
      withShareTicket: true
    })
    if (options.scene) {
      wx.setStorageSync('ReferralId', decodeURIComponent(options.scene))
      bindReferralId(decodeURIComponent(options.scene))
    }
    if (options.ReferralId) {
      wx.setStorageSync('ReferralId', options.ReferralId)
      bindReferralId(options.ReferralId)
    }
    this.getIndexData()
    // 获取轮播列表
    this.getSwipers()
    this.getNoticeCover()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetCustomerServiceStatus'
      },
      success: function (res) {
        if (res.data.Status === 'success') {
          _this.setData({
            EnableRobot: res.data.EnableRobot,
            EnableCS: res.data.EnableCustomerService
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.getIndexData()
  },

  // 上拉加载更多
  onReachBottom: function () {
    // console.log('上拉加载更多')
    if (this.index !== this.totalCount) {
      if ((this.totalCount - this.index) == this.totalCount % this.dataSize) {
        this.setData({
          indexData: this.data.indexData.concat(this.allData.slice(this.index, this.totalCount))
        }, () => {
          this.index = this.totalCount
        })
      } else {
        this.setData({
          indexData: this.data.indexData.concat(this.allData.slice(this.index, this.index + this.dataSize))
        }, () => {
          this.index += this.dataSize
        })
      }
    } else {
      console.log('没了')
    }
    // console.log(this.data.indexData)
  },

  // 监听滚动事件
  onPageScroll: function (data) {
    throttle(() => {
      if (data.scrollTop > 400) {
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

  // 分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    let path;
    if (wx.getStorageSync("ReferralId")) {
      path = "/pages/index/index?ReferralId=" + wx.getStorageSync("ReferralId")
    } else {
      path = "/pages/index/index"
    }
    return {
      path: path
    }
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

  // 获取首页数据 
  getIndexData() {
    let _this = this
    wx.request({
      url: getApp().data.url + '/API/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetShoptemplate'
      },
      success: function (res) {
        console.log('首页', res.data)
        if (res.data.Status === 'success') {
          _this.allData = res.data.LModules
          _this.totalCount = res.data.LModules.length
          _this.setData({
            indexData: res.data.LModules.slice(0, _this.dataSize)
          }, () => {
            _this.index = _this.dataSize
          })
          // console.log(_this.allData)
          // console.log(_this.data.indexData)
        }
        var richtextlist = []
        for (var v of res.data.LModules) {
          switch (v.type) {
            case 1:
              console.log("富文本");
              richtextlist.push(v)
              var richtext = richtextlist[0].content.fulltext
              WxParse.wxParse('richtext', 'html', richtext, _this, 5);
              break;
            case 2:
              console.log("文本标题");
              break;
            case 5:
              console.log("商品列表多功能");
              break;
            case 7:
              console.log("文本导航");
              break;
            case 10:
              console.log("分割线");
              break;
            case 11:
              console.log("辅助空白");
              break;
            case 12:
              console.log("顶部菜单");
              break;
            case 13:
              console.log("橱窗");
              break;
            case 14:
              console.log("视频");
              break;
            case 4:
              console.log("商品列表");
              break;
            case 6:
              console.log("搜索");
              break;
            case 8:
              console.log("图片导航");
              break;
            case 9:
              console.log("图片广告");
              break;
          }
        }
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
  // 关闭弹窗
  closeWindow(value) {
    console.log(value)
    // this.selectComponent('#dialog').closeWindow();
    this.data.showWindow
    this.setData({
      showWindow: value.detail
    })
  },
})