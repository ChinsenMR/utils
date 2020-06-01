// var url = 'wss://m.hmeshop.cn'; //服务器地址
// console.log(getApp().globalData.userInfo)

function connect(user, func) {
  console.log(user.nickName)
  var username = user.nickName
  wx.connectSocket({
    url: 'wss://m.hmeshop.cn/Admin/MiniProgram/CustomerService.ashx?nickName=' + username + "&sessionId=" + wx.getStorageSync("sessionId"),
    header: {
      'content-type': 'application/json'
    },
    success: function() {
      console.log('连接成功')
    },
    fail: function() {
      console.log('信连接失败')
    }
  })
  wx.onSocketOpen(function(res) {
    wx.showToast({
      title: '通话已开通',
      icon: "success",
      duration: 2000
    })
    //接受服务器消息
    wx.onSocketMessage(func); //func回调可以拿到服务器返回的数据
  });
  wx.onSocketError(function(res) {
    console.log(1)
    wx.showToast({
      title: '信道连接失败，请检查',
      icon: "none",
      duration: 2000
    })
  })
  wx.onSocketClose(function(res) {
    console.log('连接关闭', res)
    wx.showToast({
      title: '连接断开',
      icon: "none",
      duration: 2000
    })
    setTimeout(function () {
      wx.hideLoading()
      // wx.navigateBack({
        
      // })
      // wx.switchTab({
      //   url: '/pages/headingCode/headingCode',
      // })
    }, 2000)
  })
}

//发送消息
function send(msg) {
  wx.sendSocketMessage({
    data: msg,
    fail: function() {
      wx.showToast({
        title: '连接失败，请重连',
        icon: "none",
        duration: 1500,
        mask: true
      })
      setTimeout(function () {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '网络超时，请重新连接',
          success(res) {
            if (res.confirm) {
              wx.connectSocket({
                url: 'wss://m.hmeshop.cn/Admin/MiniProgram/CustomerService.ashx?nickName=' + username + "&sessionId=" + wx.getStorageSync("sessionId"),
                header: {
                  'content-type': 'application/json'
                }
              })
            } else if (res.cancel) {
              wx.navigateBack({

              })
            }
          }
        })
      }, 2000)
    }
  });
  if (JSON.parse(msg).type != 'input') {
    wx.showToast({
      title: '正在发送',
      icon: 'loading',
      mask: true,
      duration: 1500,
      success: function() {
        setTimeout(function() {
          wx.hideLoading()
        }, 5000)
      }
    })
  }
  // console.log(JSON.parse(msg))
}

module.exports = {
  connect: connect,
  send: send
}