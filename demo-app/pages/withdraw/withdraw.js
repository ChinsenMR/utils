import {
  turnToLoginPage
} from '../../utils/login.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedtype: 0,
    allData: {},
    Remark: '', //备注
    name: '', //收款人
    requestAccount: '', //提现账号
    AccountExplain: '', //账号说明
    money: '', //提现金额
  },
  isCommission: null, // 是否从佣金页过来

  //收款人
  writeMoney(e) {
    this.data.money = e.detail.value
  },
  //收款人
  writeName(e) {
    this.data.name = e.detail.value
  },
  //提现账号
  writeRequestAccount(e) {
    this.data.requestAccount = e.detail.value
  },
  //账号说明
  writeAccountExplain(e) {
    this.data.AccountExplain = e.detail.value
  },
  //备注
  writeRemark(e) {
    this.data.Remark = e.detail.value
  },

  /**
   * 提交处理函数
   * */
  onSubmit: function (event) {
    if (this.data.selectedtype == 0 || this.data.selectedtype == 3) {
      if (this.isCommission) {
        this.AddCommissionsEx()
      } else {
        this.onWithdraw()
      } 
    } else {
      let rgxName = /^[\u4E00-\u9FA5A-Za-z]{2,8}$/
      if (!rgxName.test(this.data.name)) {
        wx.showToast({
          title: '请输入2-8位中文或英文名字',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.requestAccount) {
        wx.showToast({
          title: '请输入提现账号',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!this.data.AccountExplain) {
        wx.showToast({
          title: '请输入账号说明',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (this.isCommission) {
        this.AddCommissionsEx()
      } else {
        this.onWithdraw()
      } 
    }

  },

  // 佣金提现
  AddCommissionsEx: function () {
    wx.showLoading({
      title: '',
    })
    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=AddCommissionsEx',
      data: {
        applyMoney: this.data.money, //提现金额
        Account: this.data.requestAccount, //提现账号
        requestType: this.data.selectedtype, //提现方式
        realName: this.data.name, //收款人
        bankName: this.data.AccountExplain, //账号说明
        Remark: this.data.Remark, //备注
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: (res) => {
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          wx.hideLoading()
          console.log(res)
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            duration: 2000,
            mask: true
          })
          setTimeout(function () {
            wx.navigateBack({
            })
          }, 1600)
          wx.setStorageSync('balance', (_this.data.allData.AvailableAmount - _this.data.money))
        } else {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (e) => {
        console.log(e)
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },

  /**
   * 提现申请 网络请求
   * */
  onWithdraw: function () {

    let _this = this
    wx.request({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=BalanceWithdrawalRequest',
      data: {
        applyMoney: this.data.money, //提现金额
        Account: this.data.requestAccount, //提现账号
        requestType: this.data.selectedtype, //提现方式
        realName: this.data.name, //收款人
        bankName: this.data.AccountExplain, //账号说明
        Remark: this.data.Remark, //备注
        sessionId: wx.getStorageSync('sessionId')
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: (res) => {
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          wx.hideLoading()
          console.log(res)
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            duration: 2000,
            mask: true
          })
          setTimeout(function () {
            wx.navigateBack({

            })
          }, 2000)
          wx.setStorageSync('balance', (_this.data.allData.AvailableAmount - this.data.money))
        } else {
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (e) => {
        console.log(e)
        wx.showToast({
          title: '提现申请失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isCommission = options.commission?true:false
    // this.getBalanceWithdrawalInfo()
    if (this.isCommission) {
      this.loadCommissionInfo()
    } else {
      this.getBalanceWithdrawalInfo()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {

  // },

  //获取余额提现页面数据
  getBalanceWithdrawalInfo: function () {
    var _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetBalanceWithdrawalInfo',
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        wx.hideLoading()
        console.log('余额',res.data)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          _this.data.allData = res.data.data
          _this.setData({
            allData: res.data.data
          })
          console.log(_this.data.allData)
        } else {
          _this.data.dataLength = 0
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      },
      fail: function (e) {
        _this.setData({
          isEmpty: true
        })
        wx.hideLoading()
      }
    })
  },

  //获取佣金页面数据
  loadCommissionInfo: function () {
    var _this = this
    wx.request({
      url: getApp().data.url + '/apI/VshopProcess.ashx/ProcessRequest',
      data: {
        action: 'GetDistributorCommissionInfo',
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        wx.hideLoading()
        console.log('佣金',res.data)
        // 登陆
        if (res.data.Status === 'login') {
          turnToLoginPage()
        }
        if (res.data.Status === 'success') {
          // Object.assign({AvailableAmount:}, res.data.data)
          // _this.data.allData = res.data.data
          _this.setData({
            allData: res.data.data
          })
          console.log(_this.data.allData)
        } else {
          _this.data.dataLength = 0
          wx.showToast({
            title: res.data.errorMsg,
            icon: 'none'
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      },
      fail: function (e) {
        _this.setData({
          isEmpty: true
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  selected: function (e) {
    console.log(e)
    if (e.currentTarget.dataset.type == this.data.selectedtype) {
      return
    }
    this.setData({
      selectedtype: e.currentTarget.dataset.type
    })
    console.log(this.data.selectedtype)
  }
})