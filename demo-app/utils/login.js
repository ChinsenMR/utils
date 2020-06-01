// 登陆获取code
function login(callback) {
  wx.login({
    success(res) {
      console.log('login--', res)
      wx.request({
        url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
        data: {
          action: 'MiniProgramLogin',
          code: res.code
        },
        method: 'GET',
        success(data) {
          console.log(data)
          if (data.data.Status === 'success') {
            wx.setStorageSync('sessionId', data.data.sessionId)
            getAccessToken(data.data.sessionId)
            callback(data.data.sessionId)
          }
        },
        fail(data) {
          callback(data)
        }
      })
    }
  })
}

// 获取用户信息
function getUserInfo(sessionId) {
  // getSetting验证该用户是否授权了
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (re) => {
        if (re.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              // console.log('userInfo---',res)
              getApp().globalData.userInfo = res.userInfo
              wx.request({
                url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
                data: {
                  action: 'EncryptedData',
                  sessionId: sessionId,
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                  ReferralId: ''
                },
                success(data) {
                  resolve(data)
                  console.log('账号情况', data)
                  if (data.data.Status == 'success') {
                    if (data.data.data && data.data.data.ReferralUserId != 0) {
                      wx.setStorageSync('ReferralId', data.data.data.ReferralUserId)
                    }
                    // wx.showToast({
                    //   title: 'id:' + data.data.data.ReferralUserId,
                    //   duration: 4000
                    // })
                  }
                  if (data.data.Status == 'BindUser') {
                    wx.setStorageSync('bindUsers', JSON.stringify(data.data.data))
                    if (data.data.data && data.data.data.ReferralUserId != 0) {
                      wx.setStorageSync('ReferralId', data.data.data.ReferralUserId)
                    }
                    console.log('合并账号=', data.data)
                  }
                }
              })
            }
          })
        } else {
          reject('小程序未登陆授权')
          wx.setStorageSync('warrant', false)
        }
      }
    })
  })
}

// 验证用户是否授权
function authSetting() {
  wx.getSetting({
    success: res => {
      if (!res.authSetting['scope.userInfo']) {
        wx.navigateTo({
          url: '/pages/authorizationLogin/authorizationLogin',
        })
      }
    }
  })
}

// 判断用户是否授权
function warrant(callback) {
  // getSetting验证该用户是否授权了
  wx.getSetting({
    success: function (res) {
      if (!res.authSetting['scope.userInfo']) {
        // authSetting()
        getUserInfo(wx.getStorageSync('sessionId'))
      }
      console.log(res.authSetting['scope.userInfo'])
      callback(res.authSetting['scope.userInfo'])
    }
  })
}

/**
 * 获取accessToken
 * */
function getAccessToken(sessionId) {
  wx.request({
    url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest?action=GetMiniProgramAccessToken',
    data: {
      sessionId: sessionId
    },
    success(data) {
      wx.setStorageSync('AccessToken', data.data.data)
    }
  })
}

/**
* 绑定推荐人
* */
function bindReferralId(id) {
  console.log('推荐人id=', id)
  wx.getSetting({
    success: res => {
      if (!res.authSetting['scope.userInfo']) {
        console.log('未授权')
        wx.navigateTo({
          url: '/pages/authorizationLogin/authorizationLogin?ReferralId=' + id,
        })
      } else {
        console.log('推荐人id=', id)
        wx.request({
          url: getApp().data.url + '/Api/VshopProcess.ashx?action=BindUserReferralUserId',
          data: {
            ReferralId: id,
            sessionId: wx.getStorageSync('sessionId') ? wx.getStorageSync('sessionId') : ""
          },
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log('绑定推荐人', res)
            if (res.data.Status === 'login') {
              wx.navigateTo({
                url: '/pages/authorizationLogin/authorizationLogin?ReferralId=' + id,
              })
            }
            if (res.data.Status === 'success') {
              wx.showToast({
                title: '已绑定推荐人',
                duration: 2000
              })
              wx.setStorageSync('ReferralId', id)
            } else {
              // wx.showModal({
              //   content: '绑定推荐人失败err:' + res.data.errorMsg,
              //   showCancel: false
              // })
            }
            getUserInfo(wx.getStorageSync('sessionId'))
          },
          fail: function (e) {
            wx.showModal({
              content: '网络错误 [timoeout]',
              showCancel: false,
              complete: function () {
              }
            })
          }
        })
      }
    }
  })

}

/**
 * 跳转登陆页面
 * */
function turnToLoginPage() {
  // wx.navigateTo({
  //   url: '/pages/authorizationLogin/authorizationLogin',
  // })
  wx.hideLoading()
  setTimeout(()=>{
    wx.showToast({
      title: '您还未登录',
      icon:'none',
      duration:3000
    })
  },500)
 
}

module.exports = {
  turnToLoginPage: turnToLoginPage,
  bindReferralId: bindReferralId,
  login: login,
  authSetting: authSetting,
  getUserInfo: getUserInfo,
  warrant: warrant
}
