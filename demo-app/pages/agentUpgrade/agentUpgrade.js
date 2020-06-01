// pages/agentUpgrade/agentUpgrade.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    Name: '',
    phone: '',
    IdCard: '',
    gradeIdList: [],
    index: 0,
    cardFont: '',
    cardVerso: '',
    region:'请选择地址',
    userLogo:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that=this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getBrandLevle()
    wx.getStorage({
      key: 'userInfo',
      success (ress) {
       wx.downloadFile({
        url: ress.data.avatarUrl, //仅为示例，并非真实的资源
        success (res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            wx.uploadFile({
              url: getApp().data.url + '/Api/VshopProcess.ashx?action=UpLoadHead',
              filePath: res.tempFilePath,
              name: 'file',
              header: {
                "Content-Type": "multipart/form-data"
              },
              formData: {
                'Type': 1, // 1个人资料,2店铺
                'sessionId': wx.getStorageSync('sessionId')
              },
              success: function(getUrl) {
                wx.hideLoading()
                let sss=JSON.parse(getUrl.data)
                if(sss.Status=="success"){
                  that.setData({
                    userLogo:sss.data
                  })
                }
              },
              
            })

          
          }
        }
      })
        
      }
    })
  },

  // 选择代理级别
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 选择图片
  imgLoad: function(e) {
    var that = this,
      type = e.currentTarget.dataset.type;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        that.upLoadImg(that, res.tempFilePaths, type)
      },
      fail: function(error) {}
    })
  },

  // 上传图片
  upLoadImg: function(page, path, type) {
    wx.showLoading({
      title: '图片上传中',
      mask: true
    })
    wx.uploadFile({
      url: getApp().data.url + '/Api/VshopProcess.ashx?action=UpLoadHead',
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
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
          return;
        }
        let resData = JSON.parse(res.data)
        if (resData.Status === 'success') {
          type == 1 ? page.data.cardFont = resData.data : page.data.cardVerso = resData.data
          console.log(type)
          page.setData({
            cardFont: page.data.cardFont,
            cardVerso: page.data.cardVerso//440513199710060654
          })
        } else if (resData.Status === 'login') {
          wx.showModal({
            title: '提示',
            content: resData.errorMsg,
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/authorizationLogin/authorizationLogin',
                })
              } else if (res.cancel) {}
            }
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


  // 获取代理级别
  getBrandLevle() {
    wx.$ajax({
      api: "/apI/VshopProcess.ashx",
      data: {
        action: 'GetLowestDistributorGrade',
        SessionId: wx.getStorageSync('sessionId')
      }
    }).then(res => {
      console.log(res,'1222222222222');
      wx.hideLoading()
      this.setData({
        gradeIdList: [res]
      })
      // if (res.Status == "success") {
      //   this.setData({
      //     gradeIdList: res.data
      //   })
      //   return
      // }
      // if (res.Status == "fail" || res.data.length <= 0) {
      //   setTimeout(function() {
      //     wx.navigateBack({
      //       delta: 1
      //     })
      //   })
      // }
    })
  },

  // 表单提交  正则匹配之后再调用保存接口
  formSubmit: function(e) {
    var that = this
    if (e.detail.value.Name == "" || !this.regex().Name.test(e.detail.value.Name)) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入正确姓名',
        icon: 'none'
      })
      return
    }
    if (e.detail.value.Wechat == "") {
      wx.hideLoading()
      wx.showToast({
        title: '请输入微信号',
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
    if (e.detail.value.IdCard == '' || !this.regex().idCard.test(e.detail.value.IdCard)) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none'
      })
      return
    }
    if (this.data.cardFont == "") {
      wx.hideLoading()
      wx.showToast({
        title: '请上传截图证明',//'请上传身份证正面图',
        icon: 'none'
      })
      return
    }
    // if (this.data.cardVerso == "") {
    //   wx.hideLoading()
    //   wx.showToast({
    //     title: '请上传身份证反面图',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (e.detail.value.reMask == "") {
      wx.hideLoading()
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return
    }
    this.saveInfo(e.detail.value.Name, e.detail.value.Wechat, e.detail.value.phone, e.detail.value.IdCard, e.detail.value.reMask)
  },

  //保存用户信息接口
  saveInfo: function(name, Wechat, phone, CardID, reMask) {
    wx.showLoading({
      title: '提交中!',
      mask: true
    })
    wx.$ajax({
      api: '/API/VshopProcess.ashx?action=SubmitVIPInfo',
      data: {
        Name: name,
        WeChat: Wechat,
        Phone: phone,
        IdCardNo: CardID,
        CustomField8: reMask,
        HeadData:this.data.userLogo,
        CustomField5:this.data.region[0],
        CustomField6:this.data.region[1],
        CustomField7:this.data.region[2],
        CustomImageData1:this.data.cardFont,
        sessionId: wx.getStorageSync('sessionId'),
        // BrandLevle: this.data.gradeIdList[this.data.index].GradeId
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      console.log(res)
      if (res.Status === 'success') {
        wx.showToast({
          title: '提交成功'
        })
       
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 1600)
      }
      if (res.Status == "fail") {
        wx.showModal({
          title: '提示',
          content: res.errorMsg,
          showCancel: false
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.errorMsg || '保存失败',
          showCancel: false
        })
      }
    })
  },

  bindRegionChange(e){
    this.setData({
      region:e.detail.value
    })
    console.log(e)
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


  


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {

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

  // }
})