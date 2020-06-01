// pages/myConsultation/myConsultation.js
const app = getApp()
var websocket = require('../../utils/websocket.js');
import {
  str,
  keys
} from "../../utils/emoji-data.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    emojiData: str, //表情包数据
    isInput: false,
    timer: null, // 定时器
    consultData: {},
    isMore: true,
    pageIndex: 1,
    hidden: false,
    isEmpty: false,
    message: '', //输入框内容
    btnAadd: true, //发送或者多功能按键
    increase: false, //图片添加区域隐藏
    aniStyle: true, //动画效果
    focus: false, //是否获取焦点
    newslist: [], //即时聊天数组
    userInfo: {}, //用户信息
    previewImgList: [], //页面图片
    historyList: [], //历史聊天记录
    dataLength: 0,
    maxlength: 0,
    adjustposition: false, //键盘弹起是否上推
    keyheight: 0, //键盘高度
    screenHeight: 0, //屏幕高度
    allheight: 0, //聊天内容高度
    valueheight: 0, //差值高度
    voicekeyborad: true, //按钮显示语音或键盘
    voiceStatus: false, //是否长按语音输入框
    startPoint: {},
    sendLock: true, //发送锁，当为true时上锁，false时解锁发送
    phoneNum: 0, //客服电话
    performance: true, //是否已点击评价
    playVoiceStatus: false, //是否点击播放
    isscroll: false,
    scrollTop: 0,
    Csid: 0,
    emojiShow:false, //表情包面板
    isFullIphone:false //是否iPhone X以上全面屏
  },

  //自定义页面跳转
  customlist(e) {
    var ReplyId = e.target.dataset.id
    var note = e.target.dataset.title
    console.log(note)
    websocket.send('{"note":"' + note + '", "content": "' + ReplyId + '", "type":"title", "nickName": "' + this.data.userInfo.nickName + '", "avatarUrl": "' + this.data.userInfo.avatarUrl + '","isCS":"' + false + '" }')
  },

  //获取输入框内容
  bindChange(e) {
    this.data.message = e.detail.value
    if (this.data.message != '') {
      var btnAadd = false
      var increase = false
    } else {
      var btnAadd = true
      var increase = this.data.increase
    }
    this.setData({
      btnAadd: btnAadd,
      increase: increase
    })
    clearTimeout(this.data.timer)
    this.data.timer = setTimeout(function() {
      websocket.send('{ "content": "' + ' ' + '", "type":"input","nickName": "' + this.data.userInfo.nickName + '"}')
      this.data.isInput = false
    }.bind(this), 1000)
    if (this.data.isInput) {
      return
    }
    this.data.isInput = true
    websocket.send('{ "content": "' + '正在输入' + '", "type":"input", "nickName": "' + this.data.userInfo.nickName + '"}')
  },

  //点击多功能按键
  increase: function() {
    var _this = this
    if (_this.data.increase == false) {
      var focus = false
      var increase = true
      var aniStyle = true
    } else {
      var focus = true
      var increase = false
      var aniStyle = false
    }
    this.setData({
      focus: focus,
      increase: increase,
      aniStyle: aniStyle,
      emojiShow:false
    })
  },

  // 点击表情按钮
  onEmoji:function(){
    if (this.data.emojiShow == false) {
      var focus = false
      var emojiShow = true
    } else {
      var focus = true
      var emojiShow = false
    }
    this.setData({
      focus: focus,
      emojiShow: emojiShow,
      increase:false
    })
  },
  sendEmoji:function(e){
    console.log(e.currentTarget.dataset.index)
    this.setData({
      message: this.data.message + e.currentTarget.dataset.index,
      btnAadd:false
    })
  },

  //获取focus事件
  bindfocus: function(e) {
    var _this = this
    if (e.detail.height) {
      console.log('键盘高度', e.detail.height)
      var height = e.detail.height
      _this.setData({
        keyheight: height
      })
      var query = wx.createSelectorQuery()
      query.select('#allpull').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function(res) {
        var allheight = res[0].bottom, valueheight = _this.data.screenHeight - allheight, adjustposition = _this.data.adjustposition, fullheight;
        _this.data.isFullIphone ? fullheight = 100 : fullheight = 80
        var keyheight = _this.data.keyheight + fullheight
        if (valueheight > _this.data.keyheight) {
          var tupull = false
          var kheight = _this.data.keyheight
        } else {
          var tupull = true
          var kheight = 0
        }
        _this.setData({
          adjustposition: tupull,
          keyheight: kheight
        })
      })
    }
    _this.setData({
      increase: false,
      emojiShow: false
    })
  },

  //监听input失去焦点
  bindblur: function(e) {
    var fullheight
    this.data.isFullIphone ? fullheight = 20 : fullheight = 0
    this.setData({
      keyheight: fullheight,
    });
  },

  //点击空白隐藏message下选框
  outbtn() {
    this.setData({
      increase: false,
      emojiShow:false,
      aniStyle: true
    })
  },

  //发送文字
  send: function() {
    var _this = this
    if (_this.data.message == "") {
      wx.showToast({
        title: '消息不能为空',
        icon: "none",
        mask: true,
        duration: 2000
      })
    } else {
      setTimeout(function() {
        _this.setData({
          increase: false,
          emojiShow:false,
          focus: true
        })
      }, 300)
      websocket.send('{ "content": "' + _this.data.message + '", "type":"text", "nickName": "' + this.data.userInfo.nickName + '", "avatarUrl": "' + this.data.userInfo.avatarUrl + '","isCS":"' + false + '" }')
    }
  },

  //发送图片 
  chooseImage() {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9 
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        wx.uploadFile({
          url: app.data.url + '/Api/VshopProcess.ashx?action=UpLoadHead',
          name: 'file',
          header: {
            "Content-Type": "multipart/form-data"
          },
          filePath: tempFilePaths[0],
          formData: {
            'Type': 3,
            'sessionId': wx.getStorageSync('sessionId')
          },
          success: function(res) {
            console.log(res)
            let resData = JSON.parse(res.data)
            console.log(resData)
            if (resData.Status === 'success') {
              if (res.data) {
                that.setData({
                  increase: false
                })
                websocket.send('{"content":"' + resData.data + '","type":"image","nickName":"' + that.data.userInfo.nickName + '","avatarUrl":"' + that.data.userInfo.avatarUrl + '","isCS":"' + false + '"}')
              }
            } else {
              wx.showModal({
                title: '提示',
                content: resData.errorMsg,
                showCancel: false
              })
              return
            }
          }
        })
      }
    })
  },

  //图片预览 
  previewImg(e) {
    if (e.target.dataset.src.slice(0, 4) == 'http') {
      var res = e.target.dataset.src.replace(/\s*$/g, "")
    } else {
      var res = 'http:' + e.target.dataset.src
      var res = res.replace(/\s*$/g, "")
    }
    console.log(res)
    var arr = []
    arr.push(res)
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表 
    })
  },

  //呼叫客服
  CallTel: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNum
    });
  },

  //前往客服评价
  toPerformance: function(e) {
    console.log(e)
    var _this = this
    if (_this.data.performance == false) return
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: '/pages/performance/performance?id=' + id + '&name=' + name + '&url=' + url,
    })
  },

  //前往商品名片
  toGoodsCard: function() {
    wx.navigateTo({
      url: '/pages/search/search?card=true',
    })
  },

  //点击切换语音输入
  switchicon: function() {
    if (this.data.voicekeyborad == 'robot') {
      wx.showModal({
        title: '提示',
        content: '将前往客服列表',
        success(res) {
          if (res.confirm) {
            wx.closeSocket();
            wx.redirectTo({
              url: '/pages/headingCode/headingCode'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    if (this.data.voicekeyborad == true) {
      var increase = false
      var aniStyle = false
      var focus = false
      wx.getSetting({
        success(res) {
          console.log(res)
          if (!res.authSetting['scope.record']) {
            wx.authorize({
              scope: 'scope.record',
              success() {
                console.log('用户已经同意小程序使用录音功能')
              },
              fail() {
                // 用户拒绝后回调
                wx.showModal({
                  title: '提示',
                  content: '使用语音功能需要开启授权',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {}
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            })
          }
        }
      })
    } else {
      var increase = false
      var aniStyle = false
      var focus = true
    }
    this.setData({
      voicekeyborad: !this.data.voicekeyborad,
      focus: focus,
      increase: increase,
      aniStyle: aniStyle,
      scrollTop: 10000
    })
  },

  //按住语音输入
  touchdown: function(e) {
    console.log(e)
    var _this = this
    _this.data.startPoint = e.touches[0]; //记录长按时开始点信息，后面用于计算上划取消时手指滑动的距离。
    _this.setData({
      voiceStatus: true,
      sendLock: false
    })
    var startObj = {
      format: 'mp3'
    }
    wx.getRecorderManager().start(startObj); //开始录音
  },

  //松开语音输入
  touchup: function() {
    var _this = this
    wx.hideToast();
    wx.getRecorderManager().stop(); //结束录音
    _this.setData({
      voiceStatus: false,
      isscroll: true
    })
    _this.recordermanager()
  },

  //滑动语音输入
  handletouchmove: function(e) {
    console.log(this.data.isscroll)
    var moveLenght = e.touches[e.touches.length - 1].clientY - this.data.startPoint.clientY; //移动距离
    if (Math.abs(moveLenght) > 50) {
      this.setData({
        sendLock: true,
        isscroll: false
      })
    } else {
      this.setData({
        sendLock: false,
        isscroll: false
      })
    }
    this.recordermanager()
  },

  showToastmove: function() {},
  //监听录音停止
  recordermanager: function() {
    var _this = this
    wx.getRecorderManager().onStop(res => {
      console.log(res)
      if (_this.data.sendLock) {
        //不发送
      } else { //发送，发送网络请求
        if (res.duration < 1000) {
          wx.showToast({
            title: "录音时间太短",
            icon: "none",
            duration: 1000
          });
        } else {
          _this.uploadFile(res.tempFilePath, res.duration)
        }
      }
    });
  },

  //上传语音文件
  uploadFile: function(path, duration) {
    var that = this
    wx.uploadFile({
      url: app.data.url + '/Api/VshopProcess.ashx?action=UpLoadVoid',
      filePath: path,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        'Type': 'voice',
        'duration': duration,
        'sessionId': wx.getStorageSync('sessionId')
      },
      success: function(res) {
        var data = JSON.parse(res.data)
        if (data.Status === 'success') {
          websocket.send('{"content":"' + data.data + '","type":"voice","note":"' + duration + '","nickName":"' + that.data.userInfo.nickName + '","avatarUrl":"' + that.data.userInfo.avatarUrl + '","isCS":"' + false + '"}')
          wx.showToast({
            title: data.errorMsg,
            icon: 'none'
          })
        }
      },
      fail: function(e) {
        console.log(e)
        wx.showModal({
          title: '提示',
          content: '语音发送失败',
          showCancel: false
        })
      }
    })
  },

  //播放暂停语音
  videoContext: wx.createInnerAudioContext(),
  playVoice: function(e) {
    console.log(e.currentTarget.dataset)
    var second = e.currentTarget.dataset.second,
      fliepath = e.currentTarget.dataset.file,
      _this = this;
    _this.videoContext.src = fliepath;
    if (fliepath != _this.data.selectfile) {
      _this.videoContext.play()
      _this.setData({
        playVoiceStatus: true,
        selectfile: fliepath
      })
      clearTimeout(_this.data.timer)
      _this.data.timer = setTimeout(function() {
        _this.setData({
          selectfile: ''
        })
      }, parseInt(second))
    } else {
      console.log(1236321)
      _this.videoContext.stop()
      if (!_this.data.playVoiceStatus) {
        _this.setData({
          playVoiceStatus: false,
          selectfile: fliepath
        })
      } else {
        _this.setData({
          playVoiceStatus: true,
          selectfile: ''
        })
      }

    }
  },


  /**
   * 获取历史记录
   * */
  getHistoryList: function(id) {
    var _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetAllHistory',
        CsId: id,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res.data)
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin'
          })
          return
        }
        if (res.data.Status === 'success') {
          _this.data.dataLength = res.data.data.length
          _this.data.historyList = res.data.data.slice(-10)
          for (var v of _this.data.historyList) {
            switch (v.type) {
              case "text":
                var demodata = v.content.replace(/\&[a-zA-Z]+\&/g,
                  function (key, index) {
                    console.log(key);
                    return '%^' + key + '%^'
                  });
                v.content = demodata.split('%^')
                break
              case "goodsCard":
                v.content = v.content.split('^')
                break;
              case "link":
                v.content = v.content.split('^')
                break;
              case "voice":
                if (!v.second) {
                  var second = v.note
                  v.second = second
                  v.note = parseInt(v.note / 1000)
                }
                break;
            }
          }
          console.log(_this.data.historyList)
          var maxlength = _this.data.dataLength - 10
          _this.setData({
            historyList: _this.data.historyList,
            dataLength: _this.data.dataLength,
            maxlength: maxlength,
            Csid: id
          })
          var query = wx.createSelectorQuery()
          query.select('#allpull').boundingClientRect()
          query.selectViewport().scrollOffset()
          query.exec(function(res) {
            console.log(res)
            var allheight = res[0].bottom
            var valueheight = _this.data.screenHeight - allheight
            var adjustposition = _this.data.adjustposition
            var fullheight
            _this.data.isFullIphone ? fullheight = 380 : fullheight= 360
            var keyheight = fullheight
            if (valueheight > fullheight) {
              var tupull = false
            } else {
              var tupull = true
            }
            _this.setData({
              adjustposition: tupull,
              isscroll: true
            })
          })
          setTimeout(function() {
            _this.setData({
              scrollTop: _this.data.historyList.length * 1000
            });
          }, 1800)
        }
        if (res.data.Status === 'null') {
          _this.setData({
            isEmpty: true
          })
        }
      },
      fail: function(e) {
        _this.setData({
          isEmpty: _this.data.historyList.length ? false : true
        })
        wx.hideLoading()
      }
    })
  },

  upper: function(e) {
    console.log(e)
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    setTimeout(function() {
      // 隐藏导航栏加载框  
      wx.hideNavigationBarLoading();
      // 停止下拉动作  
      wx.stopPullDownRefresh();
    }, 300)
    var _this = this
    wx.request({
      url: getApp().data.url + '/Admin/MiniProgram/CustomerService.ashx',
      data: {
        action: 'GetAllHistory',
        CsId: _this.data.Csid,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function(res) {
        wx.hideLoading()
        if (res.data.Status === 'login') {
          wx.navigateTo({
            url: '/pages/authorizationLogin/authorizationLogin'
          })
          return
        }
        if (res.data.Status === 'success') {
          var dataLength = _this.data.dataLength
          var nowLength = _this.data.historyList.length
          var maxlength = dataLength - nowLength
          var newlist = res.data.data
          for (var v of newlist) {
            switch (v.type) {
              case "text":
                var demodata = v.content.replace(/\&[a-zA-Z]+\&/g,
                  function (key, index) {
                    console.log(key);
                    return '%^' + key + '%^'
                  });
                v.content = demodata.split('%^')
                break
              case "goodsCard":
                v.content = v.content.split('^')
                break;
              case "link":
                v.content = v.content.split('^')
                break;
              case "voice":
                if (!v.second) {
                  var second = v.note
                  v.second = second
                  v.note = parseInt(v.note / 1000)
                }
                break;
            }
          }
          if ((maxlength - 10) >= 0) {
            _this.data.historyList = newlist.slice(maxlength - 10, maxlength).concat(_this.data.historyList)
          } else {
            _this.data.historyList = newlist.slice(0, maxlength).concat(_this.data.historyList)
          }
          _this.setData({
            historyList: _this.data.historyList,
            maxlength: maxlength
          })
          // 隐藏导航栏加载框  
          wx.hideNavigationBarLoading();
          // 停止下拉动作  
          wx.stopPullDownRefresh();
          console.log(_this.data.historyList)
        }
        if (res.data.Status === 'null') {
          _this.setData({
            isEmpty: true
          })
        }
      },
      fail: function(e) {
        _this.setData({
          isEmpty: _this.data.historyList.length ? false : true
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this, isFullIphone = getApp().globalData.isFullIphone, fullheight;
    isFullIphone ? fullheight = 20 : fullheight = 0
    wx.setStorage({
      key: 'onPage',
      data: 'true',
    })
    if (options.onRobot) {
      wx.setNavigationBarTitle({
        title: '机器人客服',
      })
      _this.setData({
        voicekeyborad: 'robot'
      })
    }
    console.log(_this.data.voicekeyborad)
    wx.getSystemInfo({
      success: function(res) {
        var screenHeight = res.screenHeight
        _this.setData({
          screenHeight: screenHeight
        })
      },
    })
    wx.showLoading({
      title: '加载中'
    })
    let data = wx.getStorageSync("userInfo")
    _this.setData({
      userInfo: data,
      isFullIphone: isFullIphone,
      keyheight: fullheight
    })
    console.log('是否为全面屏',_this.data.isFullIphone)
    _this.getHistoryList(options.id)
    //调通接口 
    websocket.connect(_this.data.userInfo, function(res) {
      wx.hideToast()
      var list = []
      var word = _this.data.message
      var button = _this.data.btnAadd
      list = _this.data.newslist
      var resData = JSON.parse(res.data)
      if (resData.content != 'fail') {
        if (resData.type == 'image' || resData.type == 'performance' || resData.type == 'list' || resData.type == 'title') {
          list.push(resData)
        }
        if (resData.type == 'text') {
          var demodata = resData.content.replace(/\&[a-zA-Z]+\&/g,
            function(key, index) {
              console.log(key);
              return '%^' + key + '%^'
            });
          resData.content = demodata.split('%^')
          console.log(resData.content)
          list.push(resData)
        }
        if (resData.type == 'link') {
          resData.content = resData.content.split('^')
          if (resData.note === 'true') {
            wx.navigateTo({
              url: '/pages/joinNest/joinNest?parameter=' + resData.content[0],
            })
          }
          list.push(resData)
        }
        if (resData.type == 'input') {
          if (resData.content == '正在输入') {
            wx.setNavigationBarTitle({
              title: '对方正在输入...',
            })
          } else {
            wx.setNavigationBarTitle({
              title: '客户咨询',
            })
          }
        }
        if (resData.type == 'connstatus') {
          if (resData.Status == 'fail') return
          _this.setData({
            phoneNum: resData.CellPhone
          })
        }
        if (resData.type == 'goodsCard') {
          resData.content = resData.content.split('^')
          list.push(resData)
        }
        if (resData.type == 'voice') {
          var second = resData.note
          resData.second = second
          resData.note = parseInt(resData.note / 1000)
          list.push(resData)
        }
      }
      if (resData.isCS == 'false') {
        var word = ''
        var button = true
      }
      var len = 10000 + _this.data.newslist.length * 800
      _this.setData({
        newslist: list,
        message: word,
        btnAadd: button,
        scrollTop: len,
        isscroll: true
      })
      console.log('即时聊天', _this.data.newslist)
    })
    if (wx.getStorageSync('firstCardId')) {
      var jsondata = JSON.parse(wx.getStorageSync('firstCardId'))
      setTimeout(function() {
        var senddata = jsondata.ProductId + '^' + jsondata.ProductName + '^' + jsondata.ProductImg + '^' + jsondata.ProductPrice
        websocket.send('{"content":"' + senddata + '","type":"goodsCard"}')
        wx.removeStorage({
          key: 'firstCardId'
        })
      }, 1800)
    }
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
    var _this = this
    if (wx.getStorageSync('pingjia') == 'false') {
      _this.setData({
        performance: true
      })
      return
    } else if (wx.getStorageSync('pingjia') == 'true') {
      wx.removeStorage({
        key: 'pingjia'
      })
      _this.setData({
        performance: false
      })
      return
    }
    if (wx.getStorageSync('CardId')) {
      var jsondata = JSON.parse(wx.getStorageSync('CardId'))
      var data = jsondata.ProductId + '^' + jsondata.ProductName + '^' + jsondata.ProductImg + '^' + jsondata.ProductPrice
      websocket.send('{"content":"' + data + '","type":"goodsCard"}')
      wx.removeStorage({
        key: 'CardId'
      })
    }
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
    wx.closeSocket();
    wx.removeStorage({
      key: 'onPage'
    })
    wx.showToast({
      title: '连接已断开',
      icon: "none",
      duration: 1500
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

})