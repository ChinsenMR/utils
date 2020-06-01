// pages/userInfo/userInfo.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    userName: '',
    Name: '',
    phone: '',
    QQNumber: '',
    IdCard: '',
    imgURL: '/images/head-pic.png',
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
    })
    this.GetMyMemberInfo()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {
  //   // this.GetMyMemberInfo()
  // },

  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {

  // },

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
   * 获取微信头像
   * */
  getWxPic: function(e) {
    var _this = this
    wx.getUserInfo({
      success: function(res) {
        console.log(res)
        var avatar = JSON.parse(res.rawData).avatarUrl
        _this.setData({
          imgURL: avatar
        })
      },
      fail:function(res){
        console.log(res)
      }
    })
  },

  watchInput: function(e) {
    console.log('input数据', e.detail)
    console.log("正则", this.regex())
    this.setData({
      userName: e.detail.value
    })
    if (e.detail.value === '' || e.detail.value.length >= 7) {

    }
  },

  // 表单提交  正则匹配之后再调用保存接口
  formSubmit: function(e) {
    var that = this

    if (e.detail.value.username == "" || e.detail.value.username.length >= 16) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入用户名，用户名最多16个字符',
        icon: 'none'
      })
      return
    }
    if (e.detail.value.Name == "" || !this.regex().Name.test(e.detail.value.Name)) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入正确姓名',
        icon: 'none'
      })
      return
    }
    if (e.detail.value.phone == '' || !this.regex().phone.test(e.detail.value.phone) || e.detail.value.phone.length != 11) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入正确手机号码',
        icon: 'none'
      })
      return
    }
    if (e.detail.value.QQNumber) {
      if (!this.regex().qq.test(e.detail.value.QQNumber)) {
        wx.hideLoading()
        wx.showToast({
          title: '请输入正确QQ号码',
          icon: 'none'
        })
        return
      }
    }
    if (e.detail.value.IdCard) {
      if (!this.regex().idCard.test(e.detail.value.IdCard)) {
        wx.hideLoading()
        wx.showToast({
          title: '请输入身份证号',
          icon: 'none'
        })
        return
      }
    }
    this.saveInfo(e.detail.value.username, e.detail.value.phone, e.detail.value.QQNumber, e.detail.value.Name, e.detail.value.IdCard, that.data.imgURL)
  },

  // 选择图片
  imgLoad: function() {
    var that = this

    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log(res)

        that.upLoadImg(that, res.tempFilePaths)
      },
      fail: function(error) {

      }
    })
  },

  /**
   * 上传图片
   * */
  upLoadImg: function(page, path) {
    wx.showLoading({
      title: '图片上传中',
      mask: true
    })
    wx.uploadFile({
      url: app.data.url + '/Api/VshopProcess.ashx?action=UpLoadHead',
      filePath: path[0],
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        'Type': 1, // 1个人资料,2店铺
        'sessionId': wx.getStorageSync('sessionId')
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res)
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
          return;
        }
        console.log(JSON.parse(res.data))
        let resData = JSON.parse(res.data)
        if (resData.Status === 'success') {
          page.setData({
            imgURL: resData.data
          })
        } else {
          wx.showModal({
            title: '提示',
            content: resData.errorMsg,
            showCancel: false
          })
        }
      },
      fail: function(e) {
        wx.hideLoading()
        console.log(e)
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })
      }
    })
  },

  // 修改密码
  // alterPsd: function () {
  //   wx.navigateTo({
  //     url: '/pages/psd/psd',
  //   })
  // },

  // 查询接口
  GetMyMemberInfo: function() {
    var that = this
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=GetMyMemberInfo',
      data: {
        sessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      if (res.Status == 'success') {
        that.setData({
          userInfo: res.data[0],
          imgURL: res.data[0].UserHead
        })
      }
    })
  },

  //保存用户信息接口
  saveInfo: function(userName, phone, QQNumber, Name, CardID, userHead) {
    wx.showLoading({
      title: '保存中!',
      mask: true
    })
    wx.$ajax({
      api: '/Api/VshopProcess.ashx?action=SetMyMemberInfo',
      data: {
        userName: userName,
        CellPhone: phone,
        QQ: QQNumber,
        RealName: Name,
        CardID: CardID || "",
        userHead: userHead,
        sessionId: wx.getStorageSync('sessionId')
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      if (res.Status === 'success') {
        wx.showToast({
          title: '保存成功'
        })
        console.log(res)
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 1600)
      } else {
        wx.showModal({
          title: '提示',
          content: '保存失败',
          showCancel: false
        })
      }
    })
  },

  // 正则匹配
  regex: function() {
    var reGex = {
      "phone": /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/,
      "idCard": /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/,
      "qq": /^[1-9][0-9]{4,11}$/,
      'Name': /^[\u4E00-\u9FA5]+$/
    }
    return reGex
  },

  //获取微信头像
  getUserHead: function() {

  }
})